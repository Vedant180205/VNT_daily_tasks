import React from 'react';
import type { Enrollment } from '../../types/enrollment';
import { formatDate } from '../../utils/formatDate';
import { STATUS_LABELS, INVITE_LABELS, ROLE_LABELS } from '../../utils/enrollmentFlags';
import { motion } from 'framer-motion';
import { Phone, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { EnrollmentViewDialog } from './EnrollmentViewDialog';
import { EnrollmentEditDialog } from './EnrollmentEditDialog';
import { EnrollmentDeleteDialog } from './EnrollmentDeleteDialog';

interface EnrollmentsTableProps {
  enrollments: Enrollment[];
}

export const EnrollmentsTable: React.FC<EnrollmentsTableProps> = ({ enrollments }) => {
  const [viewingEnrollment, setViewingEnrollment] = React.useState<Enrollment | null>(null);
  const [editingEnrollment, setEditingEnrollment] = React.useState<Enrollment | null>(null);
  const [deletingEnrollment, setDeletingEnrollment] = React.useState<Enrollment | null>(null);

  return (
    <div className="w-full bg-white rounded-[18px] border border-gray-100 shadow-[0_8px_30px_rgba(15,23,42,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Name</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Contact</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Team</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Status</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Invite</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Role</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider">Date</th>
              <th className="px-6 py-5 text-[12px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
            }}
          >
            {enrollments.map((enrollment) => (
              <motion.tr 
                key={enrollment.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors h-[72px]"
              >
                <td className="px-6 py-3 font-semibold text-text">{enrollment.name}</td>
                <td className="px-6 py-3 text-muted text-sm">
                  <div className="flex items-center gap-2"><Phone size={14}/>{enrollment.phone}</div>
                </td>
                <td className="px-6 py-3 text-sm font-medium">{enrollment.team_name || 'Unassigned'}</td>
                <td className="px-6 py-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold
                    ${enrollment.status === 1 ? 'bg-green-100 text-green-700' : 
                      enrollment.status === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[enrollment.status] || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold
                    ${enrollment.invite_type === 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {INVITE_LABELS[enrollment.invite_type] || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary">
                    {ROLE_LABELS[enrollment.role] || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-3 text-muted text-sm">
                  <div className="flex items-center gap-2"><Calendar size={14}/>{formatDate(enrollment.enrolled_at)}</div>
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setViewingEnrollment(enrollment)} className="p-2 text-primary hover:bg-primary/10 rounded-md" title="View"><Eye size={16}/></button>
                    <button onClick={() => setEditingEnrollment(enrollment)} className="p-2 text-primary hover:bg-primary/10 rounded-md" title="Edit"><Edit size={16}/></button>
                    <button onClick={() => setDeletingEnrollment(enrollment)} className="p-2 text-danger hover:bg-danger/10 rounded-md" title="Delete"><Trash2 size={16}/></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>

      {viewingEnrollment && (
        <EnrollmentViewDialog enrollment={viewingEnrollment} open={!!viewingEnrollment} onOpenChange={(open) => !open && setViewingEnrollment(null)} />
      )}
      {editingEnrollment && (
        <EnrollmentEditDialog enrollment={editingEnrollment} open={!!editingEnrollment} onOpenChange={(open) => !open && setEditingEnrollment(null)} />
      )}
      {deletingEnrollment && (
        <EnrollmentDeleteDialog enrollment={deletingEnrollment} open={!!deletingEnrollment} onOpenChange={(open) => !open && setDeletingEnrollment(null)} />
      )}
    </div>
  );
};
