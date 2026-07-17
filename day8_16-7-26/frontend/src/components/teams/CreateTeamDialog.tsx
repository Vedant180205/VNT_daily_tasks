import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useCreateTeam } from '../../hooks/useTeams';
import { Plus } from 'lucide-react';

export const CreateTeamDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  
  const createTeam = useCreateTeam(() => {
    setOpen(false);
    setName('');
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createTeam.mutate(name.trim());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto shrink-0 gap-2 shadow-sm">
          <Plus size={18} />
          Add Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create New Team</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-1">
              Team Name <span className="text-danger">*</span>
            </label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. India"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTeam.isPending || !name.trim()}>
              {createTeam.isPending ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
