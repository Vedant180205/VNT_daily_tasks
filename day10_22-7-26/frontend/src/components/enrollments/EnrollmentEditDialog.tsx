import React from 'react';
import type { Enrollment } from '../../types/enrollment';

interface DialogProps {
  enrollment: Enrollment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnrollmentEditDialog: React.FC<DialogProps> = ({ enrollment, open, onOpenChange }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Edit Enrollment</h2>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <p className="text-muted text-sm">Editing functionality will be implemented in the next phase.</p>
          <p><strong>Editing:</strong> {enrollment.name}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-100">Cancel</button>
          <button onClick={() => onOpenChange(false)} className="px-5 py-2.5 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
