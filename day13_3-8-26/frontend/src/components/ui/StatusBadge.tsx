import React from 'react';
import { cn } from '../../utils/cn';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'active' | 'inactive' | 'pending' | 'rejected' | 'success' | 'warning' | 'error' | 'info';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, children, ...props }) => {
  const statusStyles = {
    active: "bg-success/10 text-success",
    success: "bg-success/10 text-success",
    inactive: "bg-muted/10 text-muted",
    pending: "bg-warning/10 text-warning",
    warning: "bg-warning/10 text-warning",
    rejected: "bg-danger/10 text-danger",
    error: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium",
        statusStyles[status] || statusStyles.info,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
