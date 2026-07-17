import React, { useState } from 'react';
import type { Player } from '../../types/player';
import { getInitials } from '../../utils/getInitials';
import { formatDate } from '../../utils/formatDate';
import { motion } from 'framer-motion';
import { Phone, Calendar } from 'lucide-react';
import { EditPlayerDialog } from './EditPlayerDialog';
import { DeletePlayerDialog } from './DeletePlayerDialog';

interface PlayerTableProps {
  players: Player[];
}

export const PlayerTable: React.FC<PlayerTableProps> = ({ players }) => {
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deletingPlayer, setDeletingPlayer] = useState<Player | null>(null);

  return (
    <div className="w-full bg-white rounded-[18px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Player</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider hidden sm:table-cell">Team</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider hidden md:table-cell">Contact</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider hidden lg:table-cell">Joined Date</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {players.map((player) => (
              <motion.tr 
                key={player.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group h-[80px]"
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-[42px] h-[42px] rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {getInitials(player.name)}
                    </div>
                    <div>
                      <div className="font-bold text-[15px] text-text">{player.name}</div>
                      <div className="text-[13px] text-muted">{player.email}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-3 hidden sm:table-cell">
                  {player.team_name ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100/80 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                      <span className="text-[13px] font-semibold text-gray-700">{player.team_name}</span>
                    </div>
                  ) : (
                    <span className="text-[13px] text-gray-400 font-medium">Unassigned</span>
                  )}
                </td>

                <td className="px-6 py-3 hidden md:table-cell">
                  <div className="flex items-center gap-2 text-[14px] text-muted font-medium">
                    <Phone size={14} className="stroke-[2]" />
                    {player.phone}
                  </div>
                </td>

                <td className="px-6 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-2 text-[14px] text-muted font-medium">
                    <Calendar size={14} className="stroke-[2]" />
                    {formatDate(player.created_at)}
                  </div>
                </td>

                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setEditingPlayer(player)}
                      className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setDeletingPlayer(player)}
                      className="px-3 py-1.5 rounded-md text-[13px] font-semibold text-danger bg-danger/5 hover:bg-danger/10 transition-colors border border-danger/10"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {editingPlayer && (
        <EditPlayerDialog 
          player={editingPlayer} 
          open={!!editingPlayer} 
          onOpenChange={(open) => !open && setEditingPlayer(null)} 
        />
      )}
      
      {deletingPlayer && (
        <DeletePlayerDialog 
          player={deletingPlayer} 
          open={!!deletingPlayer} 
          onOpenChange={(open) => !open && setDeletingPlayer(null)} 
        />
      )}
    </div>
  );
};
