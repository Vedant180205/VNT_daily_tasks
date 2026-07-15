import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useUploadCsv } from '../../hooks/useMutations';
import { getUploadStatus } from '../../api/playerApi';
import { useQueryClient } from '@tanstack/react-query';

export const BulkUploadDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ total: number, completed: number, failed: number, errors?: { name: string, email: string, reason: string }[] } | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useUploadCsv((id) => {
    setUploadId(id);
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  useEffect(() => {
    if (!uploadId) return;

    const interval = setInterval(async () => {
      try {
        const data = await getUploadStatus(uploadId);
        setStatus(data);
        if (data.total > 0 && data.completed + data.failed === data.total) {
          clearInterval(interval);
          queryClient.invalidateQueries({ queryKey: ['players'] });
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [uploadId, queryClient]);

  const handleClose = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setFile(null);
        setUploadId(null);
        setStatus(null);
        uploadMutation.reset();
      }, 300);
    }
  };

  const isComplete = status && status.total > 0 && (status.completed + status.failed === status.total);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto shrink-0 gap-2 shadow-sm">
          <Upload size={18} />
          Bulk Upload
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Bulk Upload Players</DialogTitle>
        <div className="space-y-4 py-4">
          {!uploadId ? (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ensure your CSV has the following columns: name, email, phone, team_id
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              {!isComplete ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : (
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              )}
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">
                  {!isComplete ? "Processing CSV..." : "Upload Complete!"}
                </h3>
                {status ? (
                  <div className="mt-4 flex gap-6 text-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-xl">{status.total}</span>
                      <span className="text-muted-foreground">Total</span>
                    </div>
                    <div className="flex flex-col items-center text-green-600">
                      <span className="font-semibold text-xl">{status.completed}</span>
                      <span>Success</span>
                    </div>
                    <div className="flex flex-col items-center text-red-600">
                      <span className="font-semibold text-xl">{status.failed}</span>
                      <span>Failed</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">Waiting for status...</p>
                )}
              </div>
              
              {isComplete && status?.errors && status.errors.length > 0 && (
                <div className="w-full mt-4 max-h-48 overflow-y-auto border border-border rounded-md">
                  <div className="bg-destructive/10 px-4 py-2 sticky top-0 border-b border-border">
                    <h4 className="text-sm font-semibold text-destructive">Failed Rows ({status.failed})</h4>
                  </div>
                  <ul className="divide-y divide-border">
                    {status.errors.map((err, i) => (
                      <li key={i} className="px-4 py-3 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{err.name} <span className="text-muted-foreground font-normal">({err.email})</span></span>
                          <span className="text-destructive text-xs">{err.reason}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            {!uploadId ? (
              <>
                <Button variant="outline" onClick={() => handleClose(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!file || uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </>
            ) : (
              <Button onClick={() => handleClose(false)} disabled={!isComplete}>
                {!isComplete ? "Processing..." : "Close"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
