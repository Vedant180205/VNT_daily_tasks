import React from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useTeams } from '../../hooks/useTeams';
import { STATUS_LABELS, INVITE_LABELS, ROLE_LABELS } from '../../utils/enrollmentFlags';

interface EnrollmentsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  invite_type: string;
  onInviteTypeChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  team_id: string;
  onTeamIdChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  onExport: () => void;
}

export const EnrollmentsToolbar: React.FC<EnrollmentsToolbarProps> = ({
  search, onSearchChange,
  status, onStatusChange,
  invite_type, onInviteTypeChange,
  role, onRoleChange,
  team_id, onTeamIdChange,
  limit, onLimitChange,
  onExport
}) => {
  const { teams } = useTeams();

  return (
    <div className="flex flex-col gap-4 mb-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-gray-100 rounded-[18px] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        
        {/* Search */}
        <div className="flex items-center gap-2 bg-gray-50/50 rounded-lg px-3 flex-grow max-w-sm">
          <svg className="text-muted w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <Input 
            type="text" 
            placeholder="Search name or phone..." 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-[14px] h-[40px] bg-transparent font-medium w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={status} onChange={(e) => onStatusChange(e.target.value)} className="w-[120px] bg-gray-50/50 border-none text-[13px] font-semibold h-[40px]">
            <option value="">All Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>

          <Select value={invite_type} onChange={(e) => onInviteTypeChange(e.target.value)} className="w-[140px] bg-gray-50/50 border-none text-[13px] font-semibold h-[40px]">
            <option value="">All Invites</option>
            {Object.entries(INVITE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>

          <Select value={role} onChange={(e) => onRoleChange(e.target.value)} className="w-[140px] bg-gray-50/50 border-none text-[13px] font-semibold h-[40px]">
            <option value="">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>

          <Select value={team_id} onChange={(e) => onTeamIdChange(e.target.value)} className="w-[140px] bg-gray-50/50 border-none text-[13px] font-semibold h-[40px]">
            <option value="">All Teams</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </div>

        {/* Export & Limit */}
        <div className="flex items-center gap-4 border-l pl-4 border-gray-100">
          <div className="flex items-center gap-2">
             <span className="text-[13px] text-muted font-medium">Show:</span>
             <Select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="w-[70px] bg-gray-50/50 border-none text-[13px] font-semibold h-[40px]">
               <option value={10}>10</option>
               <option value={20}>20</option>
               <option value={50}>50</option>
               <option value={100}>100</option>
             </Select>
          </div>
          <button 
            onClick={onExport}
            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[13px] font-bold transition-colors"
          >
            Export CSV
          </button>
        </div>

      </div>
    </div>
  );
};
