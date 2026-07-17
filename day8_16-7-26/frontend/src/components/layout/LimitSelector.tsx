import React from 'react';
import { Select } from '../ui/Select';

interface LimitSelectorProps {
  limit: number;
  onLimitChange: (limit: number) => void;
}

export const LimitSelector: React.FC<LimitSelectorProps> = ({ limit, onLimitChange }) => {
  return (
    <div className="flex items-center bg-gray-50/50 rounded-lg pr-2 shrink-0">
      <Select 
        value={limit.toString()} 
        onChange={(e) => onLimitChange(Number(e.target.value))}
        className="w-[70px] border-none shadow-none focus-visible:ring-0 text-[14px] h-[40px] bg-transparent font-semibold text-text px-2 text-center"
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </Select>
    </div>
  );
};
