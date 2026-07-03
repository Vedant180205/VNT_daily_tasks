import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';
import { PlayerForm } from './PlayerForm';
import type { PlayerFormData } from './PlayerForm';
import { useUpdatePlayer } from '../../hooks/useMutations';
import type { Player } from '../../types/player';

interface EditPlayerDialogProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditPlayerDialog: React.FC<EditPlayerDialogProps> = ({ player, open, onOpenChange }) => {
  const updatePlayer = useUpdatePlayer(() => onOpenChange(false));

  const handleSubmit = (data: PlayerFormData) => {
    updatePlayer.mutate({ id: player.id, data });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Edit Player</DialogTitle>
        <PlayerForm 
          initialData={{ name: player.name, email: player.email, phone: player.phone }}
          onSubmit={handleSubmit}
          isLoading={updatePlayer.isPending}
          onCancel={() => onOpenChange(false)}
          submitText="Save Changes"
          loadingText="Saving..."
        />
      </DialogContent>
    </Dialog>
  );
};
