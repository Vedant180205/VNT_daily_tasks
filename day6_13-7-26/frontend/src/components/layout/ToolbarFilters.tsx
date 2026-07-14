import React from 'react';
import { SearchBar } from './SearchBar';
import { SortDropdown } from './SortDropdown';
import { LimitSelector } from './LimitSelector';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useTeams } from '../../hooks/useTeams';

interface ToolbarFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  order: string;
  onOrderChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  team: string;
  onTeamChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
}

export const ToolbarFilters: React.FC<ToolbarFiltersProps> = ({
  search, onSearchChange,
  sort, onSortChange,
  order, onOrderChange,
  limit, onLimitChange,
  team, onTeamChange,
  date, onDateChange
}) => {
  const { teams } = useTeams();

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full flex-wrap">
      <SearchBar value={search} onChange={onSearchChange} />
      
      <div className="flex flex-wrap items-center gap-4">
        <Select value={team} onChange={(e) => onTeamChange(e.target.value)} className="w-[180px]">
          <option value="">All Teams</option>
          {teams.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </Select>
        
        <div className="flex items-center gap-2">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => onDateChange(e.target.value)} 
            className="w-[150px]"
            title="Filter by Creation Date"
          />
          {date && (
            <button 
              onClick={() => onDateChange('')}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <SortDropdown 
          sort={sort} order={order} 
          onSortChange={onSortChange} onOrderChange={onOrderChange} 
        />
        <LimitSelector limit={limit} onLimitChange={onLimitChange} />
      </div>
    </div>
  );
};
