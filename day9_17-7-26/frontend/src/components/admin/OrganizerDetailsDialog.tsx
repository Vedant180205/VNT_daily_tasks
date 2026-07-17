import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Check, Ban, ExternalLink } from 'lucide-react';

interface OrganizerDetailsDialogProps {
  organizer: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export const OrganizerDetailsDialog: React.FC<OrganizerDetailsDialogProps> = ({ 
  organizer, isOpen, onClose, onApprove, onReject 
}) => {
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

  const renderDocument = (url: string) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    const fullUrl = `http://localhost:3000${url}`;
    
    return (
      <a 
        key={url} 
        href={fullUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="relative group border border-border rounded-lg overflow-hidden h-32 flex items-center justify-center bg-background hover:border-primary/50 transition-colors"
      >
        {isPdf ? (
          <div className="flex flex-col items-center p-4">
            <FileText className="w-10 h-10 text-red-500 mb-2" />
            <span className="text-xs text-center line-clamp-1 w-full font-medium text-muted">View PDF</span>
          </div>
        ) : (
          <img src={fullUrl} alt="Document" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[70] grid w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl">
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-xl font-bold text-text">
              Organizer Details
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Review full application details before deciding.
            </Dialog.Description>
          </div>

          <div className="mt-2 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Applicant Name</p>
                <p className="font-medium text-text">{organizer.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Organization</p>
                <p className="font-medium text-text">{organizer.org_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Email</p>
                <p className="font-medium text-text">{organizer.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Phone</p>
                <p className="font-medium text-text">{organizer.phone}</p>
              </div>
            </div>

            <div className="h-px w-full bg-border/50" />

            {/* IDs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Aadhaar Number</p>
                <p className="font-medium text-text font-mono">{organizer.aadhaar_number}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">PAN Number</p>
                <p className="font-medium text-text font-mono uppercase">{organizer.pan_number}</p>
              </div>
            </div>

            <div className="h-px w-full bg-border/50" />

            {/* Address */}
            <div>
              <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Address</p>
              <p className="font-medium text-text">{organizer.address}</p>
              <p className="text-sm text-muted mt-0.5">{organizer.city}, {organizer.state} • {organizer.zone} Zone</p>
            </div>

            <div className="h-px w-full bg-border/50" />

            {/* Documents */}
            <div>
              <p className="text-xs text-muted mb-3 uppercase font-semibold tracking-wider flex items-center gap-2">
                <FileText size={14} /> Uploaded Documents ({documents.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {documents.map(renderDocument)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onReject}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors font-medium"
            >
              <Ban size={18} /> Reject
            </button>
            <button
              onClick={onApprove}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-green-500/20"
            >
              <Check size={18} /> Approve
            </button>
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
