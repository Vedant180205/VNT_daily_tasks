import React from 'react';
import { SearchBar } from './SearchBar';
import { SortDropdown } from './SortDropdown';
import { LimitSelector } from './LimitSelector';

interface ToolbarFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  order: string;
  onOrderChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
}

export const ToolbarFilters: React.FC<ToolbarFiltersProps> = ({
  search, onSearchChange,
  sort, onSortChange,
  order, onOrderChange,
  limit, onLimitChange
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full">
      <SearchBar value={search} onChange={onSearchChange} />
      <div className="flex flex-wrap items-center gap-4">
        <SortDropdown 
          sort={sort} order={order} 
          onSortChange={onSortChange} onOrderChange={onOrderChange} 
        />
        <LimitSelector limit={limit} onLimitChange={onLimitChange} />
      </div>
    </div>
  );
};
