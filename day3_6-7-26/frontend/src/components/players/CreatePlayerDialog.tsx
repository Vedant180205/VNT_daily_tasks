import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';
import { PlayerForm } from './PlayerForm';
import type { PlayerFormData } from './PlayerForm';
import { useCreatePlayer } from '../../hooks/useMutations';

export const CreatePlayerDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const createPlayer = useCreatePlayer(() => setOpen(false));

  const handleSubmit = (data: PlayerFormData) => {
    createPlayer.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto shrink-0 gap-2 shadow-sm">
          <Plus size={18} />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create Player</DialogTitle>
        <PlayerForm 
          onSubmit={handleSubmit}
          isLoading={createPlayer.isPending}
          onCancel={() => setOpen(false)}
          submitText="Create Player"
          loadingText="Creating..."
        />
      </DialogContent>
    </Dialog>
  );
};
