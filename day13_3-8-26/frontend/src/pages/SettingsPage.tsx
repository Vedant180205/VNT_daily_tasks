import React, { useEffect, useState } from 'react';
import { Mail, Edit3, X, Save, AlertCircle, Trash2 } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { apiClient } from '../api/axios';
import { authService } from '../services/authService';
import { ErrorState } from '../components/ui/ErrorState';

interface EmailTemplate {
  id: number;
  template_name: string;
  subject: string;
  body_html: string;
  available_variables: string[];
  updated_at: string;
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'email' | 'notifications'>('email');
  const [userRole, setUserRole] = useState<string | null>(null);

  // Email Templates State
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetRole, setNotifTargetRole] = useState<string>('');
  const [notifCreating, setNotifCreating] = useState(false);

  useEffect(() => {
    fetchUserRole();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications' && userRole === 'Admin') {
      fetchNotifications();
    }
  }, [activeTab, userRole]);

  const fetchUserRole = async () => {
    try {
      const res = await authService.getCurrentUser();
      setUserRole(res.data?.role || 'User');
    } catch (err) {
      console.error('Failed to get user role', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/email-templates');
      setTemplates(res.data.data);
      setError(null);
      setIsAccessDenied(false);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access Denied');
        setIsAccessDenied(true);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch templates');
        setIsAccessDenied(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await apiClient.get('/api/notifications');
      setNotifications(res.data.data);
      setNotifError(null);
    } catch (err: any) {
      setNotifError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleEditClick = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setEditSubject(template.subject);
    setEditBody(template.body_html);
    setSaveSuccess(false);
  };

  const handleCloseEdit = () => {
    setEditingTemplate(null);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    try {
      setSaving(true);
      await apiClient.put(`/api/admin/email-templates/${editingTemplate.id}`, {
        subject: editSubject,
        body_html: editBody,
      });
      setSaveSuccess(true);
      fetchTemplates();
      setTimeout(() => {
        handleCloseEdit();
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    try {
      setNotifCreating(true);
      await apiClient.post('/api/notifications', {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        target_role_id: notifTargetRole ? parseInt(notifTargetRole) : null
      });
      
      setNotifTitle('');
      setNotifMessage('');
      setNotifTargetRole('');
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create notification');
    } finally {
      setNotifCreating(false);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await apiClient.delete(`/api/notifications/${id}`);
      fetchNotifications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[48px] font-[800] text-[#111827] tracking-tight leading-none mb-2">Settings</h1>
          <p className="text-muted text-base">Manage application preferences, notifications, and templates.</p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="border-b border-border mb-8">
          <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'email'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              Email Templates
            </button>
            {userRole === 'Admin' && (
              <button
                onClick={() => setActiveTab('notifications')}
                className={`pb-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === 'notifications'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-text'
                }`}
              >
                Notifications Manager
              </button>
            )}
            <button
              disabled
              className="pb-4 text-sm font-semibold border-b-2 border-transparent text-gray-300 cursor-not-allowed"
            >
              General Settings (Coming Soon)
            </button>
          </nav>
        </div>

        {activeTab === 'email' && (
          <div>
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <ErrorState 
                isAccessDenied={isAccessDenied}
                message={error}
                onRetry={fetchTemplates}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-5 border-b border-border bg-gray-50 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-text mb-1">{template.template_name}</h3>
                        <p className="text-xs text-muted">Last updated: {new Date(template.updated_at).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={() => handleEditClick(template)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit Template"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div>
                        <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1">Subject</span>
                        <p className="text-sm font-medium text-text line-clamp-2">{template.subject}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && userRole === 'Admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Notification Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-border flex flex-col gap-4 h-fit shadow-sm">
              <h2 className="text-xl font-bold text-text mb-2">Create Notification</h2>
              <form onSubmit={handleCreateNotification} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    placeholder="Enter notification title..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Target User Type (Role)</label>
                  <select
                    value={notifTargetRole}
                    onChange={e => setNotifTargetRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm bg-white"
                  >
                    <option value="">All Users (General)</option>
                    <option value="1">Admin</option>
                    <option value="2">Sub Admin</option>
                    <option value="3">Player / User</option>
                    <option value="4">Organizer</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={notifMessage}
                    onChange={e => setNotifMessage(e.target.value)}
                    placeholder="Enter notification message details..."
                    className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={notifCreating}
                  className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 disabled:opacity-75"
                >
                  {notifCreating ? 'Sending...' : 'Send Notification'}
                </button>
              </form>
            </div>

            {/* List Active Notifications */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-border flex flex-col gap-4 shadow-sm">
              <h2 className="text-xl font-bold text-text mb-2">Active Notifications Logs</h2>
              {notifLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : notifError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                  <AlertCircle size={16} /> {notifError}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-muted py-12 border border-dashed border-gray-200 rounded-xl">
                  No active notifications found.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {notifications.map((notif: any) => (
                    <div key={notif.id} className="p-5 border border-border rounded-xl flex justify-between items-start hover:shadow-sm transition-shadow">
                      <div className="space-y-1.5 flex-1 mr-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-text text-base">{notif.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            notif.target_role_id === 1 ? 'bg-red-50 text-red-700' :
                            notif.target_role_id === 4 ? 'bg-amber-50 text-amber-700' :
                            notif.target_role_id === 2 ? 'bg-indigo-50 text-indigo-700' :
                            notif.target_role_id === 3 ? 'bg-green-50 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            Target: {notif.target_role_name || 'All Users'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed break-words">{notif.message}</p>
                        <span className="text-[11px] text-muted block">
                          Sent: {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNotification(notif.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors shrink-0"
                        title="Delete Notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ height: '90vh', maxHeight: '90vh' }}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-text">Edit Template: {editingTemplate.template_name}</h3>
                <p className="text-sm text-muted mt-1">Use standard HTML for styling. Variables will be injected automatically.</p>
              </div>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-4 bg-gray-50" style={{ minHeight: 0 }}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Email Subject</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>

              <div className="flex flex-col gap-2 flex-1" style={{ minHeight: 0 }}>
                <label className="text-sm font-semibold text-gray-700">Email Body (HTML)</label>
                <textarea
                  value={editBody}
                  onChange={e => setEditBody(e.target.value)}
                  className="w-full flex-1 resize-y p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm leading-relaxed"
                  style={{ minHeight: '200px' }}
                  spellCheck="false"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white rounded-b-2xl">
              <button
                onClick={handleCloseEdit}
                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saveSuccess}
                className={`px-6 py-2.5 font-medium rounded-xl transition-all flex items-center gap-2
                  ${saveSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20'
                  } disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                <Save size={18} />
                {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
