import React from 'react';
import { NavLink } from 'react-router-dom';
import { authService } from '../../services/authService';
import { 
  BarChart2, 
  Users, 
  Shield, 
  Briefcase, 
  Settings, 
  LogOut,
  Activity,
  Trophy,
  Bell,
  Upload,
  ClipboardList
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const mainNav = [
    { label: 'Analytics', icon: BarChart2, path: '/dashboard' },
    { label: 'Players', icon: Users, path: '/players' },
    { label: 'Teams', icon: Shield, path: '/teams' },
    { label: 'Organizers', icon: Briefcase, path: '/organizers' },
    { label: 'Enrollments', icon: ClipboardList, path: '/enrollments' },
    { label: 'Activity Logs', icon: Activity, path: '/activity' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Notifications', icon: Bell, path: '/notifications' },
    { label: 'Upload Players', icon: Upload, path: '/upload' },
  ];

  const bottomNav = [
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Sign Out', icon: LogOut, path: '/logout' },
  ];

  return (
    <div className="w-[260px] h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-[90px] px-8 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        </div>
        <h2 className="text-xl font-bold text-text">PlayerHub</h2>
      </div>

      {/* Navigation */}
      <nav className="px-6 py-4 space-y-1">
        {mainNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-secondary text-text font-semibold shadow-sm' 
                  : 'text-muted hover:bg-gray-50 hover:text-text font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? "text-primary" : "text-muted"} />
                <span className="text-[14.5px]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 border-t border-border"></div>

      <nav className="px-6 space-y-1">
        {bottomNav.map((item) => (
          item.label === 'Sign Out' ? (
            <button
              key={item.label}
              onClick={() => authService.logout()}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-muted hover:bg-gray-50 hover:text-text font-medium"
            >
              <item.icon size={20} />
              <span className="text-[14.5px]">{item.label}</span>
            </button>
          ) : (
            <NavLink
              key={item.label}
              to={item.path}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-muted hover:bg-gray-50 hover:text-text font-medium"
            >
              <item.icon size={20} />
              <span className="text-[14.5px]">{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>


    </div>
  );
};
