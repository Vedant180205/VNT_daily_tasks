import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { useDeleteTeam } from '../../hooks/useTeams';
import { AlertTriangle } from 'lucide-react';
import type { Team } from '../../types/team';

interface DeleteTeamDialogProps {
  team: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteTeamDialog: React.FC<DeleteTeamDialogProps> = ({ team, open, onOpenChange }) => {
  const deleteTeam = useDeleteTeam(() => {
    onOpenChange(false);
  });

  const handleDelete = () => {
    deleteTeam.mutate(team.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center text-center pt-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <DialogTitle className="text-xl">Delete Team</DialogTitle>
          <p className="text-sm text-muted mt-2 mb-6">
            Are you sure you want to delete <span className="font-semibold text-text">{team.name}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex w-full gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={deleteTeam.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              disabled={deleteTeam.isPending}
            >
              {deleteTeam.isPending ? 'Deleting...' : 'Yes, delete team'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
