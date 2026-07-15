import React, { useState } from 'react';
import type { Player } from '../../types/player';
import { getInitials } from '../../utils/getInitials';
import { formatDate } from '../../utils/formatDate';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { EditPlayerDialog } from './EditPlayerDialog';
import { DeletePlayerDialog } from './DeletePlayerDialog';

interface PlayerCardProps {
  player: Player;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        variants={{
          hidden: { opacity: 0, x: -10 },
          visible: { opacity: 1, x: 0 }
        }}
        className="group relative bg-surface border border-border rounded-lg p-4 transition-colors hover:bg-border/30 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {getInitials(player.name)}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-medium text-text truncate">{player.name}</h3>
            <div className="flex items-center gap-4 mt-0.5 text-xs text-muted truncate">
              <span className="flex items-center gap-1.5"><Mail size={12} /> {player.email}</span>
              <span className="flex items-center gap-1.5"><Phone size={12} /> {player.phone}</span>
              <span className="hidden sm:flex items-center gap-1.5"><Calendar size={12} /> {formatDate(player.created_at)}</span>
              {player.team_name && <span className="flex items-center gap-1.5 font-medium text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Team: {player.team_name}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button 
            onClick={() => setIsEditDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted hover:text-text hover:bg-background rounded transition-colors"
            aria-label={`Edit ${player.name}`}
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
          <button 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
            aria-label={`Delete ${player.name}`}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </motion.div>

      {isEditDialogOpen && (
        <EditPlayerDialog 
          player={player} 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
        />
      )}
      
      {isDeleteDialogOpen && (
        <DeletePlayerDialog 
          player={player} 
          open={isDeleteDialogOpen} 
          onOpenChange={setIsDeleteDialogOpen} 
        />
      )}
    </>
  );
};
