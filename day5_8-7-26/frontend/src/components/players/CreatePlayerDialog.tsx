import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';
import { PlayerForm } from './PlayerForm';
import { useCreatePlayer } from '../../hooks/useMutations';

export const CreatePlayerDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const createPlayer = useCreatePlayer(() => {
    setOpen(false);
    setProgress(0);
  });

  const handleSubmit = (data: FormData) => {
    createPlayer.mutate({
      data,
      onUploadProgress: (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        setProgress(percentCompleted);
      }
    });
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
          uploadProgress={progress}
        />
      </DialogContent>
    </Dialog>
  );
};
