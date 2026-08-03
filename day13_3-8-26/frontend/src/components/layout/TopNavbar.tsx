import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Sun, BellOff } from 'lucide-react';
import { apiClient } from '../../api/axios';
import { authService } from '../../services/authService';

export const TopNavbar: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserData();
    fetchMyNotifications();

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await authService.getCurrentUser();
      if (res?.data) {
        setUserName(res.data.name || 'User');
        setUserRole(res.data.role || '');
      }
    } catch (err) {
      console.error('Failed to get user data in TopNavbar', err);
    }
  };

  const fetchMyNotifications = async () => {
    try {
      const res = await apiClient.get('/api/notifications/my');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch user notifications', err);
    }
  };

  const avatarLetter = userName.charAt(0).toUpperCase();

  return (
    <header className="h-[72px] bg-background flex items-center justify-between px-8 border-b border-border sticky top-0 z-40">
      <div className="flex items-center gap-6 flex-1">
        <button className="text-muted hover:text-text transition-colors">
          <Menu size={24} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex items-center gap-5 relative">
        {/* Notification Bell with Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 text-muted hover:text-text hover:bg-gray-100/50 rounded-xl transition-all"
          >
            <Bell size={20} strokeWidth={1.5} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-background">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-border shadow-xl z-50 overflow-hidden animate-fadeIn">
              <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
                <span className="font-bold text-text text-sm">Notifications</span>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {notifications.length} alerts
                </span>
              </div>

              <div className="max-h-[300px] overflow-y-auto divide-y divide-border">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-gray-50/50 transition-colors flex flex-col gap-1">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-text text-sm leading-tight">{notif.title}</span>
                        <span className="text-[9px] text-muted whitespace-nowrap ml-2">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed break-words">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <BellOff size={18} className="text-muted" />
                    </div>
                    <span className="text-sm font-semibold text-text">All caught up!</span>
                    <span className="text-xs text-muted mt-0.5">No new notifications.</span>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border bg-gray-50 text-center">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-bold text-primary hover:text-primary/80 transition-colors w-full"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>
        
        <button className="text-muted hover:text-text transition-colors p-2 hover:bg-gray-100/50 rounded-xl">
          <Sun size={20} strokeWidth={1.5} />
        </button>
        
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
            {avatarLetter}
          </div>
          <div className="flex flex-col hidden sm:flex">
            <span className="text-sm font-bold text-text leading-tight">{userName}</span>
            <span className="text-[10px] text-muted font-medium">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
