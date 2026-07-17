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
  sort, onSortChange,
  order, onOrderChange,
  limit, onLimitChange,
  team, onTeamChange,
  date, onDateChange
}) => {
  const { teams } = useTeams();

  return (
    <div className="flex flex-wrap items-center gap-4 w-full justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-[14px] text-muted font-medium bg-gray-50/50 rounded-lg pr-2">
          <svg className="ml-3 text-muted w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <Select value={team} onChange={(e) => onTeamChange(e.target.value)} className="w-[160px] border-none shadow-none focus-visible:ring-0 text-[14px] h-[40px] bg-transparent font-semibold text-text">
            <option value="">All Teams</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50/50 rounded-lg px-2">
          <Input 
            type="date" 
            value={date} 
            onChange={(e) => onDateChange(e.target.value)} 
            className="w-[140px] border-none shadow-none focus-visible:ring-0 text-[14px] h-[40px] bg-transparent text-muted font-semibold"
            title="Filter by Creation Date"
          />
          {date && (
            <button 
              onClick={() => onDateChange('')}
              className="text-xs text-danger font-medium hover:text-danger/80"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted font-medium">Sort by</span>
          <SortDropdown 
            sort={sort} order={order} 
            onSortChange={onSortChange} onOrderChange={onOrderChange} 
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted font-medium">Show:</span>
          <LimitSelector limit={limit} onLimitChange={onLimitChange} />
        </div>
      </div>
    </div>
  );
};
