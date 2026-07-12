import { useState, useEffect } from 'react';
import { api } from '../api';

const COLUMNS = [
  { id: 'REPORTED',            label: 'Reported',           color: 'var(--s-orange)' },
  { id: 'APPROVED',            label: 'Approved',           color: 'var(--s-blue)'   },
  { id: 'TECHNICIAN_ASSIGNED', label: 'Tech Assigned',      color: 'var(--s-purple)' },
  { id: 'IN_PROGRESS',         label: 'In Progress',        color: 'var(--s-yellow)' },
  { id: 'RESOLVED',            label: 'Resolved',           color: 'var(--s-green)'  },
];

export default function MaintenanceWorkflow() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try { setRequests(await api.getMaintenanceRequests()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const onDragStart = (e, id) => e.dataTransfer.setData('id', id);
  const onDragOver  = (e)     => e.preventDefault();

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('id');
    if (!id) return;
    setRequests(prev => prev.map(r => r.id.toString() === id ? { ...r, status: newStatus } : r));
    try { await api.updateMaintenanceStatus(id, { status: newStatus }); }
    catch (e) { alert(e.message); loadRequests(); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Maintenance</h2>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? <p className="animate-pulse">Loading board…</p> : (
        <div className="kanban-wrap">
          {COLUMNS.map(col => {
            const items = requests.filter(r => r.status === col.id);
            return (
              <div key={col.id} className="kanban-col" onDragOver={onDragOver} onDrop={e => onDrop(e, col.id)}>
                <div className="kanban-col-header">
                  <span style={{ color: col.color }}>{col.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>
                    {items.length}
                  </span>
                </div>
                <div className="kanban-col-body">
                  {items.map(r => (
                    <div
                      key={r.id}
                      className="kanban-card"
                      draggable
                      onDragStart={e => onDragStart(e, r.id)}
                    >
                      <div className="kanban-card-title">Asset #{r.asset_id}</div>
                      <div className="kanban-card-meta" style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        {r.issue_description}
                      </div>
                      <div className="kanban-card-meta">
                        <span>Reporter #{r.requester_id}</span>
                        <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
                          · {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
