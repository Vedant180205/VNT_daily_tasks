import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, CheckCircle2, ExternalLink } from 'lucide-react';
import { adminApi } from '../../api/admin';

interface OrganizerDocsDialogProps {
  organizer: any;
  isOpen: boolean;
  onClose: () => void;
  onVerifiedSuccess: () => void;
}

export const OrganizerDocsDialog: React.FC<OrganizerDocsDialogProps> = ({
  organizer,
  isOpen,
  onClose,
  onVerifiedSuccess
}) => {
  const [isVerifying, setIsVerifying] = useState(false);

  if (!organizer) return null;

  let documents: string[] = [];
  try {
    if (typeof organizer.documents === 'string') {
      documents = JSON.parse(organizer.documents);
    } else if (Array.isArray(organizer.documents)) {
      documents = organizer.documents;
    }
  } catch (e) {
    console.error("Failed to parse documents", e);
  }

  const isAlreadyVerified = organizer.approval_status === 4;

  const handleMarkVerified = async () => {
    try {
      setIsVerifying(true);
      await adminApi.verifyOrganizerDocuments(organizer.id);
      onVerifiedSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify documents');
    } finally {
      setIsVerifying(false);
    }
  };

  const renderDocument = (url: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    const fullUrl = `http://localhost:3000${url}`;

    return (
      <a
        key={url}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative group border border-border rounded-xl overflow-hidden h-40 flex items-center justify-center bg-background hover:border-primary/50 transition-all shadow-sm"
      >
        {isPdf ? (
          <div className="flex flex-col items-center p-4">
            <FileText className="w-12 h-12 text-red-500 mb-2" />
            <span className="text-xs text-center line-clamp-1 w-full font-bold text-text">View PDF Document</span>
          </div>
        ) : (
          <img src={fullUrl} alt="KYC Document" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ExternalLink className="w-6 h-6 text-white" />
        </div>
      </a>
    );
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[70] grid w-full max-w-xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-2xl">
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-xl font-bold text-text flex items-center justify-between">
              <span>KYC Verification Documents</span>
              {isAlreadyVerified && (
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-green-500/10 text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Documents Verified
                </span>
              )}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Submitted documents for **{organizer.full_name}** ({organizer.org_name}).
            </Dialog.Description>
          </div>

          <div className="mt-3 space-y-4">
            {documents.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-xl text-center text-muted text-sm">
                No KYC documents uploaded.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map(renderDocument)}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-text font-medium text-xs rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
            {!isAlreadyVerified && (
              <button
                onClick={handleMarkVerified}
                disabled={isVerifying}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs rounded-lg transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> {isVerifying ? 'Verifying...' : 'Mark Documents Verified'}
              </button>
            )}
          </div>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
