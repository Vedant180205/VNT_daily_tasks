import React from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  isSearchActive?: boolean;
  onClearSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isSearchActive, onClearSearch }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border rounded-xl bg-surface/30"
    >
      <div className="h-16 w-16 bg-border/40 rounded-full flex items-center justify-center mb-5 text-muted shadow-sm">
        <Users size={32} />
      </div>
      <h3 className="text-xl font-semibold text-text mb-2">
        {isSearchActive ? 'No players match your search.' : 'No players found'}
      </h3>
      <p className="text-muted max-w-sm mb-6">
        {isSearchActive 
          ? 'Try adjusting your filters or search terms.' 
          : 'Create your first player to get started.'}
      </p>
      
      {isSearchActive && onClearSearch && (
        <Button variant="secondary" onClick={onClearSearch}>
          Clear Search
        </Button>
      )}
    </motion.div>
  );
};
