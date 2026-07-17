import React from 'react';
import { cn } from '../../utils/cn';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-[48px] w-full rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2 text-[15px] text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary appearance-none cursor-pointer transition-all duration-200 shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Select.displayName = 'Select';
