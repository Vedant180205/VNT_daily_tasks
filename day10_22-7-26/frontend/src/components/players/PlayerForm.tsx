import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useTeams } from '../../hooks/useTeams';
import { ImageUploader } from './ImageUploader';

const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[^\d]*$/, "Name cannot contain numbers"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().length(10, "Phone must be exactly 10 digits").regex(/^\d+$/, "Phone must contain only numbers"),
  team_id: z.union([z.string(), z.number()]).optional().nullable().transform(val => (!val || val === 'none') ? null : Number(val))
});

export type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  submitText: string;
  loadingText: string;
  uploadProgress?: number;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ 
  initialData, onSubmit, isLoading, onCancel, submitText, loadingText, uploadProgress 
}) => {
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [retainedGallery, setRetainedGallery] = useState<string[]>([]);
  const [existingAvatar, setExistingAvatar] = useState<string[]>([]);
  const [avatarError, setAvatarError] = useState(false);
  const [galleryError, setGalleryError] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: initialData || { name: '', email: '', phone: '', team_id: 'none' }
  });

  const { teams } = useTeams();

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        team_id: initialData.team_id || 'none'
      });
      if (initialData.avatar) setExistingAvatar([initialData.avatar]);
      if (initialData.gallery) {
         const galleryData = typeof initialData.gallery === 'string' ? JSON.parse(initialData.gallery) : initialData.gallery;
         setRetainedGallery(Array.isArray(galleryData) ? galleryData : []);
      }
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: PlayerFormData) => {
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('email', data.email);
    fd.append('phone', data.phone);
    if (data.team_id) fd.append('team_id', data.team_id.toString());

    if (avatarFiles.length > 0) {
      fd.append('avatar', avatarFiles[0]);
    }
    
    galleryFiles.forEach(file => {
      fd.append('gallery', file);
    });
    
    retainedGallery.forEach(url => {
      fd.append('retained_gallery', url);
    });

    onSubmit(fd);
  };
  
  const handleRemoveRetainedGallery = (url: string) => {
    setRetainedGallery(prev => prev.filter(item => item !== url));
  };
  
  const handleRemoveExistingAvatar = () => {
    setExistingAvatar([]);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 mt-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-text">Name</label>
        <Input 
          {...register('name')} 
          placeholder="e.g. Vedant Patil" 
          disabled={isLoading}
          className={errors.name ? 'border-danger focus-visible:ring-danger' : ''}
        />
        {errors.name && <p className="text-xs text-danger">{errors.name.message as string}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-text">Email</label>
        <Input 
          {...register('email')} 
          type="email" 
          placeholder="e.g. vedant@example.com" 
          disabled={isLoading}
          className={errors.email ? 'border-danger focus-visible:ring-danger' : ''}
        />
        {errors.email && <p className="text-xs text-danger">{errors.email.message as string}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-text">Phone Number</label>
        <Input 
          {...register('phone')} 
          placeholder="e.g. 1234567890" 
          disabled={isLoading}
          className={errors.phone ? 'border-danger focus-visible:ring-danger' : ''}
        />
        {errors.phone && <p className="text-xs text-danger">{errors.phone.message as string}</p>}
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-text">Team</label>
        <Select 
          {...register('team_id')} 
          disabled={isLoading}
        >
          <option value="none">Free Agent (None)</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </Select>
        {errors.team_id && <p className="text-xs text-danger">{errors.team_id.message as string}</p>}
      </div>

      <ImageUploader 
        label="Avatar (1 Image)" 
        maxFiles={1} 
        files={avatarFiles} 
        onChange={setAvatarFiles} 
        disabled={isLoading}
        existingImages={existingAvatar}
        onRemoveExisting={handleRemoveExistingAvatar}
        onErrorChange={setAvatarError}
      />

      <ImageUploader 
        label="Gallery (Up to 5 Images)" 
        maxFiles={5} 
        files={galleryFiles} 
        onChange={setGalleryFiles} 
        disabled={isLoading}
        existingImages={retainedGallery}
        onRemoveExisting={handleRemoveRetainedGallery}
        onErrorChange={setGalleryError}
      />

      {(avatarError || galleryError) && (
        <p className="text-sm text-danger mt-2 font-medium">Please remove duplicate images before saving.</p>
      )}

      {uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-border rounded-full h-2 mt-4">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || avatarError || galleryError}>
          {isLoading ? loadingText : submitText}
        </Button>
      </div>
    </form>
  );
};
