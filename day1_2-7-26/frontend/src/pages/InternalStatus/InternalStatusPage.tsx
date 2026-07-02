import { useEffect, useState } from 'react';
import { getStatus } from '../../api/statusApi';
import type { StatusResponse } from '../../types/status.types';
import styles from './InternalStatus.module.css';

const InternalStatusPage = () => {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStatus();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Helper to format timestamp
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // ---- LOADING ----
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <h2>⏳ Loading status...</h2>
      </div>
    );
  }

  // ---- ERROR ----
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>❌ Error</h2>
        <p>{error}</p>
        <button onClick={fetchStatus}>Retry</button>
      </div>
    );
  }

  // ---- NO DATA ----
  if (!data) {
    return <div>No data available.</div>;
  }

  // ---- SUCCESS ----
  const getBadgeClass = (value: string) => {
    return value === 'ok' || value === 'ok' ? styles.badgeOk : styles.badgeError;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>🔍 Internal Status</h1>
        <button
          className={styles.refreshBtn}
          onClick={fetchStatus}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.statusItem}>
          <span className={styles.label}>API</span>
          <span className={`${styles.value} ${getBadgeClass(data.api)}`}>
            {data.api}
          </span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Database</span>
          <span className={`${styles.value} ${getBadgeClass(data.database)}`}>
            {data.database}
          </span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Environment</span>
          <span className={styles.value}>{data.environment}</span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Timestamp</span>
          <span className={styles.timestamp}>{formatDate(data.timestamp)}</span>
        </div>

        <div className={styles.statusItem}>
          <span className={styles.label}>Last Successful API Response</span>
          <span className={styles.timestamp}>
            {data.lastSuccessfulApiResponseAt
              ? formatDate(data.lastSuccessfulApiResponseAt)
              : 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default InternalStatusPage;
