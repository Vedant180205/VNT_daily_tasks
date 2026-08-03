import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/Dialog';
import { usePlayer } from '../../hooks/usePlayers';
import { Loader2, Phone, Mail, Calendar, User as UserIcon, Shield } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

interface PlayerDetailsDialogProps {
  playerId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlayerDetailsDialog: React.FC<PlayerDetailsDialogProps> = ({ playerId, open, onOpenChange }) => {
  const { data: player, isLoading, isError } = usePlayer(playerId);

  let galleryImages: string[] = [];
  if (player?.gallery) {
    try {
      galleryImages = typeof player.gallery === 'string' ? JSON.parse(player.gallery) : player.gallery;
    } catch (e) {
      console.error("Failed to parse gallery", e);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <DialogTitle>Player Details</DialogTitle>
        
        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : isError || !player ? (
            <div className="text-center py-10 text-danger">Failed to load player details.</div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-border shadow-sm">
                  {player.avatar ? (
                    <img 
                      src={`http://localhost:3000${player.avatar}`} 
                      alt={player.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <UserIcon size={48} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <h2 className="text-2xl font-bold text-text">{player.name}</h2>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 rounded-md mt-2">
                      <Shield size={14} className="text-primary" />
                      <span className="text-[13px] font-semibold text-primary">{player.team_name || 'Free Agent'}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Mail size={16} />
                      {player.email}
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Phone size={16} />
                      {player.phone}
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Calendar size={16} />
                      Joined {formatDate(player.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              {galleryImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-text mb-4 border-b border-border pb-2">Gallery</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {galleryImages.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-border shadow-sm group">
                        <img 
                          src={`http://localhost:3000${url}`} 
                          alt={`Gallery ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
