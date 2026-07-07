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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted font-medium">Sort by</span>
        <Select 
          value={sort} 
          onChange={(e) => onSortChange(e.target.value)}
          className="w-32"
        >
          <option value="name">Name</option>
          <option value="email">Email</option>
          <option value="created_at">Joined Date</option>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted font-medium">Order</span>
        <Select 
          value={order} 
          onChange={(e) => onOrderChange(e.target.value)}
          className="w-32"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </Select>
      </div>
    </div>
  );
};
