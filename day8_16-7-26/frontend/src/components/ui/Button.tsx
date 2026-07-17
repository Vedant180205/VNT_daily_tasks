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
          "inline-flex items-center justify-center rounded-[14px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-[1px]",
          "h-[52px] px-6 shadow-sm hover:shadow-md",
          variant === 'primary' && "bg-primary text-white hover:bg-primary-hover border border-transparent",
          variant === 'secondary' && "bg-white border border-[#ECECEC] hover:bg-gray-50 text-text",
          variant === 'danger' && "bg-danger text-white hover:bg-danger/90 border border-transparent",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
