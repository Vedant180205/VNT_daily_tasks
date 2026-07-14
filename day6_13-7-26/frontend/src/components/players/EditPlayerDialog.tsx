import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';
import { PlayerForm } from './PlayerForm';
import { useUpdatePlayer } from '../../hooks/useMutations';
import type { Player } from '../../types/player';

interface EditPlayerDialogProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPlayerDialog: React.FC<EditPlayerDialogProps> = ({ player, open, onOpenChange }) => {
  const [progress, setProgress] = useState(0);
  const updatePlayer = useUpdatePlayer(() => {
    onOpenChange(false);
    setProgress(0);
  });

  const handleSubmit = (data: FormData) => {
    updatePlayer.mutate({ 
      id: player.id, 
      data,
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setProgress(percentCompleted);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Player</DialogTitle>
        <PlayerForm 
          initialData={{ 
            name: player.name, 
            email: player.email, 
            phone: player.phone, 
            team_id: player.team_id,
            avatar: player.avatar,
            gallery: player.gallery
          }}
          onSubmit={handleSubmit}
          isLoading={updatePlayer.isPending}
          onCancel={() => onOpenChange(false)}
          submitText="Save Changes"
          loadingText="Saving..."
          uploadProgress={progress}
        />
      </DialogContent>
    </Dialog>
  );
};
