import React from 'react';
import type { Player } from '../../types/player';
import { PlayerCard } from './PlayerCard';
import { motion } from 'framer-motion';

interface PlayerGridProps {
  players: Player[];
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({ players }) => {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08
          }
        }
      }}
      className="flex flex-col gap-3"
    >
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </motion.div>
  );
};
