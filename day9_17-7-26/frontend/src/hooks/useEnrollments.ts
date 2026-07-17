import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchEnrollments } from '../api/enrollmentApi';
import type { FetchEnrollmentsParams } from '../api/enrollmentApi';
import { STATUS_LABELS, INVITE_LABELS, ROLE_LABELS } from '../utils/enrollmentFlags';
import { formatDate } from '../utils/formatDate';

export const useEnrollments = (params: FetchEnrollmentsParams) => {
  const query = useQuery({
    queryKey: ['enrollments', params.page, params.limit, params.search, params.status, params.invite_type, params.role, params.team_id],
    queryFn: () => fetchEnrollments(params),
    placeholderData: keepPreviousData,
  });

  const exportCSV = async (exportParams: FetchEnrollmentsParams) => {
    try {
      // Fetch all matching rows by removing limits
      const res = await fetchEnrollments({ ...exportParams, limit: 100000, page: 1 });
      const data = res.data;
      
      if (data.length === 0) {
        alert("No data to export");
        return;
      }

      // Convert to CSV string
      const headers = ['Name', 'Phone', 'Team', 'Status', 'Invite Type', 'Role', 'Enrolled At'];
      const csvRows = [headers.join(',')];

      for (const row of data) {
        const values = [
          `"${row.name}"`,
          `"${row.phone}"`,
          `"${row.team_name || 'N/A'}"`,
          `"${STATUS_LABELS[row.status] || 'Unknown'}"`,
          `"${INVITE_LABELS[row.invite_type] || 'Unknown'}"`,
          `"${ROLE_LABELS[row.role] || 'Unknown'}"`,
          `"${formatDate(row.enrolled_at)}"`
        ];
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      
      // Trigger download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'enrollments_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export CSV", err);
      alert("Failed to export CSV");
    }
  };

  return {
    enrollments: query.data?.data || [],
    pagination: query.data?.pagination || null,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: query.isError,
    refetch: query.refetch,
    exportCSV
  };
};
