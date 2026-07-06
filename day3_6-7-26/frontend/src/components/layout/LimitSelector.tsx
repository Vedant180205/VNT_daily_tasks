import React from 'react';
import { Select } from '../ui/Select';

interface LimitSelectorProps {
  limit: number;
  onLimitChange: (limit: number) => void;
}

export const LimitSelector: React.FC<LimitSelectorProps> = ({ limit, onLimitChange }) => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm text-muted hidden sm:inline-block">Show:</span>
      <Select 
        value={limit.toString()} 
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="w-20"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </Select>
    </div>
  );
};
