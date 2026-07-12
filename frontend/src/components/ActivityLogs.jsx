import { useState, useEffect } from 'react';
import { api } from '../api';

export default function ActivityLogs() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => { fetch_(); }, []);

  const fetch_ = async () => {
    try { setLogs(await api.getActivityLogs(50)); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const actionBadge = (action) => {
    const cls = {
      create: 'badge-approved',
      update: 'badge-allocated',
      delete: 'badge-rejected',
      status_change: 'badge-pending',
    }[action?.toLowerCase()] || 'badge-pending';
    return <span className={`badge ${cls}`}>{action}</span>;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Activity Logs</h2>
        <button className="btn btn-secondary" onClick={fetch_}>Refresh</button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <p className="animate-pulse">Loading logs…</p>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="5" className="empty-state">No activity recorded yet.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td className="text-muted text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 500 }}>#{log.user_id}</td>
                  <td>{actionBadge(log.action)}</td>
                  <td className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {log.entity_type} #{log.entity_id}
                  </td>
                  <td className="text-muted text-sm">{log.metadata_info || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
