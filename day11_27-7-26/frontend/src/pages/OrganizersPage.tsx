import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { motion } from 'framer-motion';
import { Users, Ban, Eye, AlertTriangle, Send, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { adminApi } from '../api/admin';
import { OrganizerDetailsDialog } from '../components/admin/OrganizerDetailsDialog';
import { OrganizerDocsDialog } from '../components/admin/OrganizerDocsDialog';
import { Card, CardContent } from '../components/ui/Card';

export const OrganizersPage: React.FC = () => {
  const [allOrganizers, setAllOrganizers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrganizer, setSelectedOrganizer] = useState<any | null>(null);
  const [docsModalOrg, setDocsModalOrg] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal state for sending registration link
  const [linkModalOrg, setLinkModalOrg] = useState<any | null>(null);
  const [expiresInHours, setExpiresInHours] = useState<number>(48);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isSendingLink, setIsSendingLink] = useState(false);

  // Modal state for rejecting application lead
  const [rejectModalOrg, setRejectModalOrg] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminApi.getOrganizers();
      setAllOrganizers(res.data || []);
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

  // Section 1 Filter: Lead Applications (Status 0 = Pending Review, Status 2 = Registration Link Sent)
  const leadApplications = allOrganizers.filter(o => o.approval_status === 0 || o.approval_status === 2);

  // Section 2 Filter: Completed Registrations (Status 3 = Registration Completed, Status 4 = Documents Verified)
  const pendingKYCVerifications = allOrganizers.filter(o => o.approval_status === 3 || o.approval_status === 4);

  // Section 3 Filter: Active Organizers (Status 5 = Active or is_active = 1)
  const activeOrganizers = allOrganizers.filter(o => o.approval_status === 5 || o.is_active === 1);

  const handleSendRegistrationLink = async () => {
    if (!linkModalOrg) return;
    try {
      setIsSendingLink(true);
      const res = await adminApi.approveOrganizer(linkModalOrg.id, expiresInHours);
      setGeneratedLink(res.data?.inviteLink || 'Link generated successfully');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate registration link');
    } finally {
      setIsSendingLink(false);
    }
  };

  const handleRejectOrganizer = async () => {
    if (!rejectModalOrg) return;
    try {
      setIsSubmittingReject(true);
      await adminApi.rejectOrganizer(rejectModalOrg.id, rejectionReason);
      setRejectModalOrg(null);
      setRejectionReason('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject application');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleFinalActivate = async (id: number) => {
    if (!window.confirm('Are you sure you want to approve and activate this organizer account?')) return;
    try {
      await adminApi.activateOrganizer(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate organizer account');
    }
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
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-[40px] font-[800] text-[#111827] tracking-tight leading-none mb-2">Organizers Lifecycle Management</h1>
        <p className="text-muted text-base">3-Section Admin Approval Workflow: Lead Applications $\rightarrow$ KYC Verification $\rightarrow$ Active Organizers.</p>
      </motion.div>

      {/* SECTION 1: Lead Applications & Invitations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            Section 1: Phase 1 Lead Applications (Pending Link Dispatch)
            <span className="bg-amber-500/10 text-amber-600 text-xs py-1 px-2.5 rounded-full font-bold">
              {leadApplications.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="h-24 bg-white rounded-xl animate-pulse"></div>
        ) : leadApplications.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-gray-100 border-dashed text-center text-muted text-sm">
            No new lead applications pending.
          </div>
        ) : (
          <div className="grid gap-4">
            {leadApplications.map(org => (
              <div key={org.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-text">{org.full_name}</h4>
                      <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-amber-500/10 text-amber-600">
                        {org.approval_status === 2 ? 'Registration Link Sent' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{org.org_name}</p>
                    <p className="text-xs text-muted mt-0.5">{org.email} • {org.phone} • {org.city}, {org.state}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedOrganizer(org)} className="px-3.5 py-1.5 bg-gray-100 text-text font-medium text-xs rounded-lg hover:bg-gray-200 flex items-center gap-1.5">
                    <Eye size={14} /> View Details
                  </button>
                  <button
                    onClick={() => {
                      setLinkModalOrg(org);
                      setGeneratedLink(null);
                    }}
                    className="px-3.5 py-1.5 bg-primary text-white font-medium text-xs rounded-lg hover:bg-primary-hover flex items-center gap-1.5"
                  >
                    <Send size={14} /> {org.approval_status === 2 ? 'Resend Registration Link' : 'Send Registration Link'}
                  </button>
                  <button
                    onClick={() => {
                      setRejectModalOrg(org);
                      setRejectionReason('');
                    }}
                    className="px-3 py-1.5 bg-danger/10 text-danger font-medium text-xs rounded-lg hover:bg-danger/20 flex items-center gap-1.5"
                  >
                    <Ban size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SECTION 2: Completed Registrations & Document Verification */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            Section 2: Phase 2 Registrations Completed (Pending Final Approval & Activation)
            <span className="bg-purple-500/10 text-purple-600 text-xs py-1 px-2.5 rounded-full font-bold">
              {pendingKYCVerifications.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="h-24 bg-white rounded-xl animate-pulse"></div>
        ) : pendingKYCVerifications.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-gray-100 border-dashed text-center text-muted text-sm">
            No completed registrations awaiting document verification or activation.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingKYCVerifications.map(org => (
              <div key={org.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-2xl border border-purple-100 shadow-sm gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-text">{org.full_name}</h4>
                      {org.approval_status === 4 ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-green-500/10 text-green-600 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Documents Verified
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-600">
                          Registration Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{org.org_name}</p>
                    <p className="text-xs text-muted mt-0.5">{org.address || 'Address: N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => setSelectedOrganizer(org)} className="px-3.5 py-1.5 bg-gray-100 text-text font-medium text-xs rounded-lg hover:bg-gray-200 flex items-center gap-1.5">
                    <Eye size={14} /> View Details
                  </button>
                  <button
                    onClick={() => setDocsModalOrg(org)}
                    className="px-3.5 py-1.5 bg-purple-50 text-purple-700 font-semibold text-xs rounded-lg border border-purple-200 hover:bg-purple-100 flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} /> View & Verify Docs
                  </button>
                  <button
                    onClick={() => handleFinalActivate(org.id)}
                    className="px-3.5 py-1.5 bg-green-600 text-white font-medium text-xs rounded-lg hover:bg-green-700 flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 size={14} /> Approve & Activate Account
                  </button>
                  <button
                    onClick={() => {
                      setRejectModalOrg(org);
                      setRejectionReason('');
                    }}
                    className="px-3 py-1.5 bg-danger/10 text-danger font-medium text-xs rounded-lg hover:bg-danger/20 flex items-center gap-1.5"
                  >
                    <Ban size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* SECTION 3: Active Organizers */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            Section 3: Active Organizers (Fully Onboarded & Login Enabled)
            <span className="bg-green-500/10 text-green-600 text-xs py-1 px-2.5 rounded-full font-bold">
              {activeOrganizers.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="h-24 bg-white rounded-xl animate-pulse"></div>
        ) : activeOrganizers.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-gray-100 border-dashed text-center text-muted text-sm">
            No active organizers yet.
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Organizer Name</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeOrganizers.map((org) => (
                  <tr key={org.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-text">{org.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{org.org_name}</td>
                    <td className="px-6 py-4 text-xs text-muted">{org.email} • {org.phone}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-600">
                        <CheckCircle2 size={12} /> Active — Can Log In
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Modal: Send Registration Link */}
      {linkModalOrg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-text mb-2">Send Registration Link</h3>
            <p className="text-xs text-muted mb-4">
              Specify the invitation link expiration duration for **{linkModalOrg.full_name}** ({linkModalOrg.email}).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-text mb-1">Link Expiration (in Hours) *</label>
              <select
                value={expiresInHours}
                onChange={e => setExpiresInHours(Number(e.target.value))}
                className="w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={24}>24 Hours (1 Day)</option>
                <option value={48}>48 Hours (2 Days)</option>
                <option value={72}>72 Hours (3 Days)</option>
                <option value={168}>168 Hours (7 Days)</option>
              </select>
            </div>

            {generatedLink && (
              <div className="mb-4 p-3 bg-green-500/10 border border-green-200 rounded-lg text-xs">
                <p className="font-bold text-green-700 mb-1">Link Generated & Sent!</p>
                <p className="text-gray-600 break-all select-all font-mono bg-white p-2 rounded border border-gray-200">{generatedLink}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setLinkModalOrg(null)}
                className="px-4 py-2 bg-gray-100 text-text font-medium text-xs rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              {!generatedLink && (
                <button
                  onClick={handleSendRegistrationLink}
                  disabled={isSendingLink}
                  className="px-4 py-2 bg-primary text-white font-medium text-xs rounded-lg hover:bg-primary-hover disabled:opacity-50"
                >
                  {isSendingLink ? 'Generating...' : 'Generate & Send Link'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Application */}
      {rejectModalOrg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-text mb-2">Reject Application</h3>
            <p className="text-xs text-muted mb-4">
              Rejecting lead application for **{rejectModalOrg.full_name}** ({rejectModalOrg.email}).
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-text mb-1">Reason for Rejection (Optional)</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Invalid organization credentials or duplicate inquiry"
                className="w-full bg-surface-alt border border-border rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-danger min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setRejectModalOrg(null)}
                className="px-4 py-2 bg-gray-100 text-text font-medium text-xs rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrganizer}
                disabled={isSubmittingReject}
                className="px-4 py-2 bg-danger text-white font-medium text-xs rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: General Details */}
      {selectedOrganizer && (
        <OrganizerDetailsDialog 
          organizer={selectedOrganizer} 
          isOpen={!!selectedOrganizer} 
          onClose={() => setSelectedOrganizer(null)}
        />
      )}

      {/* Dedicated Modal: View & Verify Documents */}
      {docsModalOrg && (
        <OrganizerDocsDialog
          organizer={docsModalOrg}
          isOpen={!!docsModalOrg}
          onClose={() => setDocsModalOrg(null)}
          onVerifiedSuccess={() => fetchData()}
        />
      )}
    </PageContainer>
  );
};
