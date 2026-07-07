import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
          "h-10 py-2 px-4",
          variant === 'primary' && "bg-primary text-white hover:bg-primary/90",
          variant === 'secondary' && "bg-surface border border-border hover:bg-border text-text",
          variant === 'danger' && "bg-danger text-white hover:bg-danger/90",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
