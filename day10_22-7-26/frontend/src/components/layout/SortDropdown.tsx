import React from 'react';
import { Select } from '../ui/Select';

interface SortDropdownProps {
  sort: string;
  order: string;
  onSortChange: (sort: string) => void;
  onOrderChange: (order: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sort, order, onSortChange, onOrderChange }) => {
  return (
    <div className="flex items-center gap-2 bg-gray-50/50 rounded-lg px-2">
      <Select 
        value={sort} 
        onChange={(e) => onSortChange(e.target.value)}
        className="w-[130px] border-none shadow-none focus-visible:ring-0 text-[14px] h-[40px] bg-transparent font-semibold text-text"
      >
        <option value="name">Name</option>
        <option value="email">Email</option>
        <option value="created_at">Joined Date</option>
      </Select>
      <span className="text-[13px] text-muted font-medium px-2">Order</span>
      <Select 
        value={order} 
        onChange={(e) => onOrderChange(e.target.value)}
        className="w-[120px] border-none shadow-none focus-visible:ring-0 text-[14px] h-[40px] bg-transparent font-semibold text-text"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </Select>
    </div>
  );
};
