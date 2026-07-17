import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { motion } from 'framer-motion';
import { Users, Check, Ban, Eye, AlertTriangle, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react';
import { adminApi } from '../api/admin';
import { OrganizerDetailsDialog } from '../components/admin/OrganizerDetailsDialog';
import { formatDate } from '../utils/formatDate';

export const OrganizersPage: React.FC = () => {
  const [pendingOrganizers, setPendingOrganizers] = useState<any[]>([]);
  const [activeOrganizers, setActiveOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pendingRes, activeRes] = await Promise.all([
        adminApi.getPendingOrganizers(),
        adminApi.getOrganizers()
      ]);
      setPendingOrganizers(pendingRes.data || []);
      setActiveOrganizers(activeRes.data || []);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data.message || 'Permission denied. Admins only.');
      } else {
        setError('Failed to load organizers data.');
      }
      console.error('Failed to fetch organizers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveOrganizer(id);
      // Move from pending to active
      const approvedOrg = pendingOrganizers.find(org => org.id === id);
      if (approvedOrg) {
        setPendingOrganizers(prev => prev.filter(org => org.id !== id));
        setActiveOrganizers(prev => [approvedOrg, ...prev]);
      }
    } catch (err) {
      console.error('Failed to approve organizer', err);
      alert('Failed to approve organizer');
    }
  };

  const handleReject = async (id: number) => {
    alert('Reject functionality is not implemented on the backend yet.');
  };

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center h-[40vh] bg-white rounded-[18px] border border-gray-100 shadow-sm">
          <AlertTriangle size={48} className="text-danger mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-text mb-1">Access Denied</h3>
          <p className="text-sm text-muted">{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-10"
      >
        <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none stack-sans-headline-unique mb-2">Organizers Management</h1>
        <p className="text-muted text-base">Review applications and manage active tournament organizers.</p>
      </motion.div>

      {/* Pending Organizers Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            Pending Approvals
            {pendingOrganizers.length > 0 && (
              <span className="bg-purple-500/10 text-purple-600 text-sm py-1 px-3 rounded-full font-bold">
                {pendingOrganizers.length}
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-[90px] bg-white rounded-xl border border-gray-100 flex items-center px-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full animate-pulse mr-4"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-gray-100 rounded animate-pulse"></div>
                  <div className="w-32 h-3 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : pendingOrganizers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-[18px] border border-gray-100 shadow-sm border-dashed">
            <ShieldCheck size={40} className="text-green-500 mb-3 opacity-50" />
            <h3 className="text-base font-bold text-text mb-1">All Caught Up!</h3>
            <p className="text-sm text-muted">There are no pending organizer applications.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingOrganizers.map(org => (
              <div key={org.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white rounded-[18px] border border-gray-100 shadow-sm gap-4 transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-[16px]">{org.full_name}</h4>
                    <p className="text-[14px] font-medium text-muted">{org.org_name}</p>
                    <p className="text-[13px] text-muted/70 mt-1">{org.email} • {org.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedOrganizer(org)}
                    className="flex items-center justify-center px-4 py-2 bg-blue-500/10 text-blue-600 font-semibold hover:bg-blue-500/20 rounded-lg transition-colors gap-2"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button 
                    onClick={() => handleApprove(org.id)}
                    className="flex items-center justify-center px-4 py-2 bg-green-500/10 text-green-600 font-semibold hover:bg-green-500/20 rounded-lg transition-colors gap-2"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button 
                    onClick={() => handleReject(org.id)}
                    className="flex items-center justify-center px-4 py-2 bg-danger/10 text-danger font-semibold hover:bg-danger/20 rounded-lg transition-colors gap-2"
                  >
                    <Ban size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Active Organizers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text">Active Organizers</h2>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
             {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[76px] bg-white rounded-xl border border-gray-100 flex items-center px-6">
                <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse mr-4"></div>
                <div className="w-48 h-4 bg-gray-100 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : activeOrganizers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-[18px] border border-gray-100 shadow-sm border-dashed">
            <Users size={40} className="text-muted mb-3 opacity-50" />
            <h3 className="text-base font-bold text-text mb-1">No Active Organizers</h3>
            <p className="text-sm text-muted">You haven't approved any organizers yet.</p>
          </div>
        ) : (
          <div className="w-full bg-white rounded-[18px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Organizer Name</th>
                    <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider hidden sm:table-cell">Organization</th>
                    <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider hidden md:table-cell">Contact</th>
                    <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activeOrganizers.map((org) => (
                    <tr 
                      key={org.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors h-[80px]"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-[42px] h-[42px] rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {org.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-bold text-[15px] text-text">{org.full_name}</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-3 hidden sm:table-cell">
                        <span className="text-[14px] font-medium text-gray-700">{org.org_name}</span>
                      </td>

                      <td className="px-6 py-3 hidden md:table-cell">
                        <div className="flex flex-col gap-1 text-[13px] text-muted">
                          <div className="flex items-center gap-1.5"><Mail size={12} className="stroke-[2]"/> {org.email}</div>
                          <div className="flex items-center gap-1.5"><Phone size={12} className="stroke-[2]"/> {org.phone}</div>
                        </div>
                      </td>

                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 text-[14px] text-muted font-medium">
                          <Calendar size={14} className="stroke-[2]" />
                          {formatDate(org.created_at)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {selectedOrganizer && (
        <OrganizerDetailsDialog 
          organizer={selectedOrganizer} 
          isOpen={!!selectedOrganizer} 
          onClose={() => setSelectedOrganizer(null)} 
          onApprove={() => {
            handleApprove(selectedOrganizer.id);
            setSelectedOrganizer(null);
          }}
          onReject={() => {
            handleReject(selectedOrganizer.id);
            setSelectedOrganizer(null);
          }}
        />
      )}
    </PageContainer>
  );
};
