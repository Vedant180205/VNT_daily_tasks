import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, limit, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / limit) || 1;

  if (totalPages <= 1) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-t border-border pt-6 mt-8"
    >
      <div className="text-sm text-muted">
        Page <span className="font-medium text-text">{currentPage}</span> of <span className="font-medium text-text">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="gap-1 px-3"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage >= totalPages}
          className="gap-1 px-3"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    </motion.div>
  );
};
