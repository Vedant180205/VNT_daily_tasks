import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FileText, Check, Ban, ExternalLink, ShieldAlert, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

interface OrganizerDetailsDialogProps {
  organizer: any;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const OrganizerDetailsDialog: React.FC<OrganizerDetailsDialogProps> = ({ 
  organizer, isOpen, onClose, onApprove, onReject 
}) => {
  if (!organizer) return null;

  // Determine whether this is a Phase 1 Lead Application (status 0, 1, 2) or Phase 2 Registration (status >= 3)
  const isPhase1Lead = organizer.approval_status === 0 || organizer.approval_status === 1 || organizer.approval_status === 2;

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
            <Dialog.Title className="text-xl font-bold text-text flex items-center gap-2">
              {isPhase1Lead ? 'Phase 1 Application Lead Info' : 'Phase 2 Completed KYC Details'}
              {organizer.approval_status === 1 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-danger/10 text-danger flex items-center gap-1">
                  <ShieldAlert size={12} /> Rejected
                </span>
              )}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              {isPhase1Lead 
                ? 'Showing information submitted during Phase 1 public application lead form.' 
                : 'Review complete registration details and uploaded KYC verification documents.'}
            </Dialog.Description>
          </div>

          <div className="mt-2 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            
            {/* Phase 1 Lead Fields */}
            <div className="bg-surface-alt/50 p-4 rounded-xl border border-border/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Phase 1 Lead Application Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">Full Name</p>
                  <p className="font-bold text-text text-sm">{organizer.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">Organization Name</p>
                  <p className="font-bold text-text text-sm">{organizer.org_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">Email Address</p>
                  <p className="font-bold text-text text-sm">{organizer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">Phone Number</p>
                  <p className="font-bold text-text text-sm">{organizer.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">State</p>
                  <p className="font-bold text-text text-sm">{organizer.state}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">City</p>
                  <p className="font-bold text-text text-sm">{organizer.city}</p>
                </div>
                <div>
                  <p className="text-xs text-muted mb-1 font-medium">Submitted Date</p>
                  <p className="font-bold text-text text-sm">{formatDate(organizer.created_at)}</p>
                </div>
              </div>

              {organizer.approval_status === 1 && organizer.rejection_reason && (
                <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                  <p className="text-xs font-bold text-danger mb-0.5">Rejection Reason:</p>
                  <p className="text-xs text-danger/90">{organizer.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Render Phase 2 Details ONLY IF NOT Phase 1 Lead */}
            {!isPhase1Lead && (
              <>
                <div className="h-px w-full bg-border/50" />

                {/* IDs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Aadhaar Number</p>
                    <p className="font-medium text-text font-mono">{organizer.aadhaar_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">PAN Number</p>
                    <p className="font-medium text-text font-mono uppercase">{organizer.pan_number || 'N/A'}</p>
                  </div>
                </div>

                <div className="h-px w-full bg-border/50" />

                {/* Address */}
                <div>
                  <p className="text-xs text-muted mb-1 uppercase font-semibold tracking-wider">Street Address</p>
                  <p className="font-medium text-text">{organizer.address || 'N/A'}</p>
                  <p className="text-sm text-muted mt-0.5">{organizer.city}, {organizer.state} • {organizer.zone || 'N/A'} Zone</p>
                </div>

                <div className="h-px w-full bg-border/50" />

                {/* Documents */}
                <div>
                  <p className="text-xs text-muted mb-3 uppercase font-semibold tracking-wider flex items-center gap-2">
                    <FileText size={14} /> Uploaded KYC Documents ({documents.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {documents.map(renderDocument)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* End of content */}

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
