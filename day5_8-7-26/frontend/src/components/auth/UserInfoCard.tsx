import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export const UserInfoCard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleName = user.role_name || 'User';

  const roleColorMap: Record<string, { bg: string; icon: React.ReactNode }> = {
    'Admin': { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: <ShieldCheck size={14} /> },
    'Sub Admin': { bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: <Shield size={14} /> },
    'User': { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <ShieldAlert size={14} /> }
  };

  const styleInfo = roleColorMap[roleName] || roleColorMap['User'];

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 min-w-[280px]">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-sm font-semibold text-text truncate max-w-[150px]" title={user.name}>{user.name}</h3>
          <p className="text-xs text-muted truncate max-w-[150px]" title={user.email}>{user.email}</p>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${styleInfo.bg}`}>
          {styleInfo.icon}
          {roleName}
        </div>
      </div>
      
      {user.permissions && user.permissions.length > 0 && (
        <div className="mt-2">
          <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-2">Permissions</p>
          <div className="flex flex-wrap gap-1.5">
            {user.permissions.map((perm) => (
              <span 
                key={perm} 
                className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-[11px] font-medium border border-gray-700/50"
              >
                {perm.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
