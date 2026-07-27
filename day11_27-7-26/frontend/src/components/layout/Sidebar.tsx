import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  Shield, 
  Briefcase, 
  Settings, 
  LogOut,
  Activity,
  Trophy
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const mainNav = [
    { label: 'Analytics', icon: BarChart2, path: '/dashboard' },
    { label: 'Players', icon: Users, path: '/players' },
    { label: 'Teams', icon: Shield, path: '/teams' },
    { label: 'Organizers', icon: Briefcase, path: '/organizers' },
    { label: 'Activity Logs', icon: Activity, path: '/activity' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
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
          <NavLink
            key={item.label}
            to={item.path}
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-muted hover:bg-gray-50 hover:text-text font-medium"
          >
            <item.icon size={20} />
            <span className="text-[14.5px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Promo Card like in reference image */}
      <div className="mt-auto px-6 pb-8">
        <div className="bg-secondary rounded-[24px] p-5 flex flex-col items-center text-center relative overflow-hidden">
          {/* Mock Illustration Area */}
          <div className="w-24 h-24 mb-4 relative z-10">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="40" fill="#E0E7FF"/>
              <path d="M50 20C40 20 30 30 30 50H70C70 30 60 20 50 20Z" fill="#4F46E5"/>
              <circle cx="50" cy="40" r="15" fill="#C7D2FE"/>
            </svg>
          </div>
          <h4 className="text-text font-bold text-[15px] leading-tight mb-2 z-10">Need help<br/>feel free to contact</h4>
          <button className="bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold py-2.5 px-6 rounded-full transition-colors z-10 shadow-md">
            Get support
          </button>
        </div>
      </div>
    </div>
  );
};
