import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center border border-danger/20 rounded-xl bg-danger/5 shadow-sm"
    >
      <div className="bg-danger/10 p-3 rounded-full mb-4">
        <AlertCircle className="text-danger w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">Unable to load players</h3>
      <p className="text-muted mb-6 max-w-sm">There was a problem connecting to the server. Please try again.</p>
      <Button variant="danger" onClick={onRetry}>Retry</Button>
    </motion.div>
  );
};
