import React, { useEffect, useState } from 'react';
import { Mail, Edit3, X, Save, AlertCircle } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { TopNavbar } from '../components/layout/TopNavbar';
import { apiClient } from '../api/axios';

interface EmailTemplate {
  id: number;
  template_name: string;
  subject: string;
  body_html: string;
  available_variables: string[];
  updated_at: string;
}

export const EmailTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/email-templates');
      setTemplates(res.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen">
        <TopNavbar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="text-primary stroke-[1.5]" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">Email Templates</h1>
                <p className="text-muted text-sm mt-1">Manage automated email contents and formatting.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
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
        </main>
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

    </div>
  );
};
