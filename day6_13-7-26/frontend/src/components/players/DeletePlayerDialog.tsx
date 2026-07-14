import React from 'react';
import { 
  AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, 
  AlertDialogAction, AlertDialogCancel 
} from '../ui/AlertDialog';
import { Button } from '../ui/Button';
import { useDeletePlayer } from '../../hooks/useMutations';
import type { Player } from '../../types/player';

interface DeletePlayerDialogProps {
  player: Player;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeletePlayerDialog: React.FC<DeletePlayerDialogProps> = ({ player, open, onOpenChange }) => {
  const deletePlayer = useDeletePlayer();

  const handleDelete = () => {
    deletePlayer.mutate(player.id, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Delete Player</AlertDialogTitle>
        <AlertDialogDescription className="mt-2 mb-4">
          Are you sure you want to delete <strong className="text-text">{player.name}</strong>?<br/>
          This action cannot be undone.
        </AlertDialogDescription>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={deletePlayer.isPending}>Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="danger" 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }} 
              disabled={deletePlayer.isPending}
            >
              {deletePlayer.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
