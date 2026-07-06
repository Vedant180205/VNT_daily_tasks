import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlayer, updatePlayer, deletePlayer } from '../api/playerApi';
import type { UpdatePlayerRequest } from '../api/playerApi';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export const useCreatePlayer = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player created successfully.');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error('This email already exists.');
      } else {
        toast.error('Unable to create player.');
      }
    }
  });
};

export const useUpdatePlayer = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdatePlayerRequest }) => updatePlayer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player updated successfully.');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 409) {
        toast.error('This email already exists.');
      } else {
        toast.error('Unable to update player.');
      }
    }
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player deleted successfully.');
    },
    onError: () => {
      toast.error('Unable to delete player.');
    }
  });
};
