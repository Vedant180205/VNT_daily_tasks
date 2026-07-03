import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").regex(/^[^\d]*$/, "Name cannot contain numbers"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().length(10, "Phone must be exactly 10 digits").regex(/^\d+$/, "Phone must contain only numbers")
});

export type PlayerFormData = z.infer<typeof playerSchema>;

interface PlayerFormProps {
  initialData?: PlayerFormData;
  onSubmit: (data: PlayerFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  submitText: string;
  loadingText: string;
}

export const PlayerForm: React.FC<PlayerFormProps> = ({ 
  initialData, onSubmit, isLoading, onCancel, submitText, loadingText 
}) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: initialData || { name: '', email: '', phone: '' }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-text">Name</label>
        <Input 
          {...register('name')} 
          placeholder="e.g. Vedant Patil" 
          disabled={isLoading}
          className={errors.name ? 'border-danger focus-visible:ring-danger' : ''}
        />
        {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
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
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-text">Phone Number</label>
        <Input 
          {...register('phone')} 
          placeholder="e.g. 1234567890" 
          disabled={isLoading}
          className={errors.phone ? 'border-danger focus-visible:ring-danger' : ''}
        />
        {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? loadingText : submitText}
        </Button>
      </div>
    </form>
  );
};
