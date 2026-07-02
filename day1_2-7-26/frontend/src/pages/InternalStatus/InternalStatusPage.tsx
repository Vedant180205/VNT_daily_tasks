import { useEffect, useState } from 'react';
import { getStatus } from '../../api/statusApi';
import type { StatusResponse } from '../../types/status.types';
import styles from './InternalStatus.module.css';

// Crisp SVG Icons instead of native emojis
const RefreshIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 21v-5h5"/>
  </svg>
);

const ActivityIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading && !data) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.pulseLoader}></div>
        <p>Connecting to system...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={styles.errorWrapper}>
        <h2>Connection Lost</h2>
        <p>{error}</p>
        <button className={styles.actionBtn} onClick={fetchStatus}>Reconnect</button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.iconBox}>
            <ActivityIcon />
          </div>
          <div>
            <h1 className={styles.title}>System Status</h1>
            <p className={styles.subtitle}>Real-time diagnostic overview</p>
          </div>
        </div>
        
        <button 
          className={`${styles.actionBtn} ${loading ? styles.isLoading : ''}`}
          onClick={fetchStatus}
          disabled={loading}
        >
          <span className={styles.btnIcon}><RefreshIcon /></span>
          {loading ? 'Syncing...' : 'Sync Data'}
        </button>
      </header>

      {data && (
        <div className={styles.glassCard}>
          <div className={styles.statusGrid}>
            
            {/* API Status */}
            <div className={styles.statusItem}>
              <span className={styles.label}>API Connectivity</span>
              <div className={`${styles.badge} ${data.api === 'ok' ? styles.badgeSuccess : styles.badgeDanger}`}>
                <span className={styles.indicator}></span>
                {data.api.toUpperCase()}
              </div>
            </div>

            {/* DB Status */}
            <div className={styles.statusItem}>
              <span className={styles.label}>Database Health</span>
              <div className={`${styles.badge} ${data.database === 'ok' ? styles.badgeSuccess : styles.badgeDanger}`}>
                <span className={styles.indicator}></span>
                {data.database.toUpperCase()}
              </div>
            </div>

            {/* Environment */}
            <div className={styles.statusItem}>
              <span className={styles.label}>Environment</span>
              <div className={styles.valueGroup}>
                <span className={styles.envTag}>{data.environment}</span>
              </div>
            </div>

            {/* Timestamp */}
            <div className={styles.statusItem}>
              <span className={styles.label}>Current Timestamp</span>
              <span className={styles.timestampData}>{formatDate(data.timestamp)}</span>
            </div>

            {/* Last Success */}
            <div className={`${styles.statusItem} ${styles.noBorder}`}>
              <span className={styles.label}>Last Successful Sync</span>
              <span className={styles.timestampData}>
                {data.lastSuccessfulApiResponseAt ? formatDate(data.lastSuccessfulApiResponseAt) : 'N/A'}
              </span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default InternalStatusPage;
