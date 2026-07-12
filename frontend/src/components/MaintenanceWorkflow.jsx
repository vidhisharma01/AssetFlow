import { useState, useEffect } from 'react';
import { api } from '../api';

export default function MaintenanceWorkflow() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Request Form State
  const [assetId, setAssetId] = useState('1');
  const [requesterId, setRequesterId] = useState('1');
  const [issue, setIssue] = useState('');
  
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await api.getMaintenanceRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createMaintenanceRequest({
        asset_id: parseInt(assetId),
        requester_id: parseInt(requesterId),
        issue_description: issue
      });
      setIssue('');
      loadRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.updateMaintenanceStatus(id, { status: newStatus });
      loadRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  const Column = ({ title, statusFilter, statusType }) => {
    const colRequests = requests.filter(r => r.status === statusFilter);
    
    return (
      <div className="glass-card flex-col" style={{ padding: '1rem', minHeight: '300px' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
          {title}
          <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{colRequests.length}</span>
        </h3>
        
        <div className="flex flex-col" style={{ gap: '0.75rem' }}>
          {colRequests.map(req => (
            <div key={req.id} className="glass-card animate-fade-in" style={{ padding: '1rem', background: 'var(--bg-primary)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                <strong>Asset #{req.asset_id}</strong>
                <span className={`badge badge-${statusType}`}>{req.status}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {req.issue_description}
              </p>
              
              {/* Action Buttons based on status */}
              <div className="flex" style={{ gap: '0.5rem' }}>
                {statusFilter === 'REPORTED' && (
                  <button onClick={() => updateStatus(req.id, 'IN_PROGRESS')} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '100%' }}>
                    Start Work
                  </button>
                )}
                {statusFilter === 'IN_PROGRESS' && (
                  <button onClick={() => updateStatus(req.id, 'RESOLVED')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '100%' }}>
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h2>Maintenance Workflow</h2>
        
        {/* Simple popover form (inline for now) */}
        <form onSubmit={handleCreate} className="flex items-center" style={{ gap: '0.5rem' }}>
          <input type="number" className="input-field" value={assetId} onChange={e => setAssetId(e.target.value)} style={{ width: '80px', padding: '0.5rem' }} title="Asset ID" required />
          <input type="text" className="input-field" value={issue} onChange={e => setIssue(e.target.value)} placeholder="Describe issue..." style={{ padding: '0.5rem' }} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>+ Report Issue</button>
        </form>
      </div>

      {loading ? <p className="animate-pulse">Loading tickets...</p> : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Column title="Reported" statusFilter="REPORTED" statusType="reported" />
          <Column title="In Progress" statusFilter="IN_PROGRESS" statusType="inprogress" />
          <Column title="Resolved" statusFilter="RESOLVED" statusType="approved" />
        </div>
      )}
    </div>
  );
}
