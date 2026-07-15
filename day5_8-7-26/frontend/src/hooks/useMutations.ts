import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlayer, updatePlayer, deletePlayer } from '../api/playerApi';
import { createTeam } from '../api/teamApi';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

export const useCreatePlayer = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, onUploadProgress }: { data: FormData, onUploadProgress?: (e: any) => void }) => createPlayer(data, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player created successfully.');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        if (err.response?.status === 403) return; // Global interceptor handles this
        if (err.response?.status === 409) {
          toast.error('This email already exists.');
          return;
        }
      }
      toast.error('Unable to create player.');
    }
  });
};

export const useUpdatePlayer = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, onUploadProgress }: { id: number, data: FormData, onUploadProgress?: (e: any) => void }) => updatePlayer(id, data, onUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Player updated successfully.');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        if (err.response?.status === 403) return; // Global interceptor handles this
        if (err.response?.status === 409) {
          toast.error('This email already exists.');
          return;
        }
      }
      toast.error('Unable to update player.');
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
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 403) return; // Global interceptor handles this
      toast.error('Unable to delete player.');
    }
  });
};

export const useCreateTeam = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (name: string) => createTeam(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created successfully.');
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 403) return; // Global interceptor handles this
      toast.error('Unable to create team.');
    }
  });
};
