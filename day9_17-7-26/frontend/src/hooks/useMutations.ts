import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlayer, updatePlayer, deletePlayer, uploadCsv } from '../api/playerApi';
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
        if (err.response?.status === 403) {
          toast.error(err.response.data.message || 'Permission denied.');
        } else if (err.response?.status === 409) {
          toast.error('This email already exists.');
        } else {
          toast.error('Unable to create player.');
        }
      } else {
        toast.error('Unable to create player.');
      }
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
        if (err.response?.status === 403) {
          toast.error(err.response.data.message || 'Permission denied.');
        } else if (err.response?.status === 409) {
          toast.error('This email already exists.');
        } else {
          toast.error('Unable to update player.');
        }
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
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 403) {
        toast.error(err.response.data.message || 'Permission denied.');
      } else {
        toast.error('Unable to delete player.');
      }
    }
  });
};

export const useUploadCsv = (onSuccessCallback?: (uploadId: string) => void) => {
  return useMutation({
    mutationFn: uploadCsv,
    onSuccess: (data) => {
      toast.success(data.message);
      if (onSuccessCallback) onSuccessCallback(data.uploadId);
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 403) {
        toast.error(err.response.data.message || 'Permission denied.');
      } else {
        toast.error('Failed to upload CSV file.');
      }
    }
  });
};
