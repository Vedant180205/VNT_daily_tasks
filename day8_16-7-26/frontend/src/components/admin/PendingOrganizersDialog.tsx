import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, Check, Ban, Eye } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { OrganizerDetailsDialog } from './OrganizerDetailsDialog';

export const PendingOrganizersDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<any | null>(null);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPendingOrganizers();
      setOrganizers(res.data);
    } catch (err: any) {
      import('sonner').then(({ toast }) => {
        if (err.response?.status === 403) {
          toast.error(err.response.data.message || 'Permission denied. Admins only.');
          setIsOpen(false);
        } else {
          toast.error('Failed to load organizers.');
        }
      });
      console.error('Failed to fetch pending organizers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrganizers();
    }
  }, [isOpen]);

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveOrganizer(id);
      setOrganizers(prev => prev.filter(org => org.id !== id));
    } catch (err) {
      console.error('Failed to approve organizer', err);
      alert('Failed to approve organizer');
    }
  };

  const handleReject = async (_id: number) => {
    // Backend doesn't have reject endpoint yet, but UI is prepared
    alert('Reject functionality is not implemented on the backend yet.');
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 border border-purple-500/20 rounded-xl transition-colors font-medium">
          <Users size={18} />
          <span>Pending Organizers</span>
          {organizers.length > 0 && !loading && (
            <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">{organizers.length}</span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-2xl">
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-xl font-bold text-text flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Pending Organizers
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted">
              Review and approve or reject organizer applications.
            </Dialog.Description>
          </div>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : organizers.length === 0 ? (
              <div className="text-center py-12 bg-background rounded-lg border border-border/50">
                <Users className="mx-auto h-12 w-12 text-muted mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-text">No pending applications</h3>
                <p className="text-sm text-muted mt-1">There are currently no organizers waiting for approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {organizers.map(org => (
                  <div key={org.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background rounded-xl border border-border/50 gap-4">
                    <div>
                      <h4 className="font-bold text-text text-lg">{org.full_name}</h4>
                      <p className="text-sm font-medium text-muted">{org.org_name}</p>
                      <p className="text-xs text-muted/70 mt-1">{org.email} • {org.phone}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedOrganizer(org)}
                        className="flex items-center justify-center p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-lg transition-colors tooltip"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleApprove(org.id)}
                        className="flex items-center justify-center p-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg transition-colors tooltip"
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => handleReject(org.id)}
                        className="flex items-center justify-center p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors tooltip"
                        title="Reject"
                      >
                        <Ban size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Dialog.Close asChild>
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Details Modal */}
      {selectedOrganizer && (
        <OrganizerDetailsDialog 
          organizer={selectedOrganizer} 
          isOpen={!!selectedOrganizer} 
          onClose={() => setSelectedOrganizer(null)} 
          onApprove={() => {
            handleApprove(selectedOrganizer.id);
            setSelectedOrganizer(null);
          }}
          onReject={() => {
            handleReject(selectedOrganizer.id);
            setSelectedOrganizer(null);
          }}
        />
      )}
    </Dialog.Root>
  );
};
