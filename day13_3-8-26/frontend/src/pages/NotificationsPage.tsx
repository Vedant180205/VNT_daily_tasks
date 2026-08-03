import React, { useEffect, useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { apiClient } from '../api/axios';
import { Bell, AlertCircle, Info, Calendar } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyNotifications();
  }, []);

  const fetchMyNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/notifications/my');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none mb-2 flex items-center gap-3">
            <Bell className="text-primary" size={38} />
            Notifications
          </h1>
          <p className="text-muted text-base">Stay updated with general announcements and targeted alerts.</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl border border-red-100 flex items-center gap-3 font-medium">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-border shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-border">
              <Bell className="text-muted" size={28} />
            </div>
            <h3 className="text-lg font-bold text-text mb-1">No Notifications Yet</h3>
            <p className="text-muted text-sm max-w-sm">When new notifications or announcements are published, they will show up here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif: any) => {
              const isTargeted = notif.target_role_id !== null;
              
              return (
                <div key={notif.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    isTargeted ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Info size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-bold text-text leading-snug">{notif.title}</h3>
                        {isTargeted && (
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Targeted Alert
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <Calendar size={14} />
                        <span>{new Date(notif.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{notif.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
