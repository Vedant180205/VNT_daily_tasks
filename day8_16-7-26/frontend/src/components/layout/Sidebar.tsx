import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Shield, 
  Upload, 
  UserCheck, 
  Activity, 
  Settings, 
  LayoutDashboard
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Players', icon: Users, path: '/players' },
    { label: 'Teams', icon: Shield, path: '/teams' },
    { label: 'Organizers', icon: UserCheck, path: '/organizers' },
    { label: 'Upload Players', icon: Upload, path: '/upload' },
    { label: 'Activity Log', icon: LayoutDashboard, path: '/activity' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="w-[260px] h-screen bg-white border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-[72px] px-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Users size={24} />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-text leading-tight">PlayerHub</h2>
          <p className="text-primary text-xs font-semibold">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/5 text-primary font-semibold' 
                  : 'text-muted hover:bg-gray-50 hover:text-text font-medium'
              }`
            }
          >
            <item.icon size={20} className="stroke-[1.5]" />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* Promo Card like in reference image */}
        <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3">
            <span className="text-xl">🏆</span>
          </div>
          <h4 className="text-text font-bold text-sm mb-1">Manage your players like a pro</h4>
          <p className="text-muted text-xs leading-relaxed">
            Add, organize and track players effortlessly.
          </p>
        </div>
      </nav>

      {/* Bottom Profile */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white cursor-pointer hover:border-gray-300 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            A
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-text">Admin</h4>
            <p className="text-xs text-muted font-medium">Super Admin</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
};
