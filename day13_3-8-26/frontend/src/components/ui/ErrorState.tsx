import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from './Button';
import { motion } from 'framer-motion';

interface ErrorStateProps {
  onRetry?: () => void;
  title?: string;
  message?: string;
  isAccessDenied?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  onRetry, 
  title, 
  message, 
  isAccessDenied 
}) => {
  if (isAccessDenied) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center border border-amber-200 rounded-3xl bg-amber-50/40 shadow-sm"
      >
        <div className="bg-amber-100 p-4 rounded-full mb-4 text-amber-600">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">Access Denied</h3>
        <p className="text-muted mb-2 max-w-md px-6">You do not have the required permissions to view this content.</p>
        <p className="text-xs text-muted/65 max-w-sm px-6">Please contact your administrator if you believe this is an error.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center border border-danger/20 rounded-xl bg-danger/5 shadow-sm"
    >
      <div className="bg-danger/10 p-3 rounded-full mb-4">
        <AlertCircle className="text-danger w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">{title || "Unable to load players"}</h3>
      <p className="text-muted mb-6 max-w-sm">{message || "There was a problem connecting to the server. Please try again."}</p>
      {onRetry && <Button variant="danger" onClick={onRetry}>Retry</Button>}
    </motion.div>
  );
};
