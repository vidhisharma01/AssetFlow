import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AllocationTransfer() {
  const [assets, setAssets]   = useState([]);
  const [users, setUsers]     = useState([]);
  const [assetId, setAssetId] = useState('');
  const [userId, setUserId]   = useState('');
  const [reason, setReason]   = useState('');

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [conflictAsset, setConflict] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [a, u] = await Promise.all([api.getAssets(), api.getUsers()]);
      setAssets(a); setUsers(u);
    } catch {}
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!assetId || !userId) { setError('Select both asset and user.'); return; }
    setLoading(true); setError(''); setConflict(null); setSuccess('');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/assets/${assetId}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ asset_id: parseInt(assetId), assigned_to_id: parseInt(userId) })
      });
      if (!res.ok) {
        if (res.status === 400) {
          const asset = assets.find(a => a.id === parseInt(assetId));
          const owner = users.find(u => u.id === asset?.assigned_to_id);
          setConflict({ asset, owner });
        } else {
          const e = await res.json();
          setError(e.detail || 'Allocation failed');
        }
      } else {
        setSuccess('Asset allocated successfully.');
        loadData();
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleTransfer = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/assets/${assetId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ to_user_id: parseInt(userId), reason })
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Transfer failed'); }
      setSuccess('Transfer request submitted. Recipient must accept from their dashboard.');
      setConflict(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const toUser = users.find(u => u.id === parseInt(userId));

  return (
    <div className="animate-fade-in" style={{ maxWidth: '720px' }}>
      <div className="page-header">
        <h2 className="page-title">Allocation &amp; Transfer</h2>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {/* Direct allocation form */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Direct Allocation</h3>
        <form onSubmit={handleAllocate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Asset</label>
              <select className="input-field" value={assetId} onChange={e => { setAssetId(e.target.value); setConflict(null); setError(''); setSuccess(''); }}>
                <option value="">Select asset…</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.name} · {a.serial_number}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Assign To</label>
              <select className="input-field" value={userId} onChange={e => { setUserId(e.target.value); setConflict(null); setError(''); setSuccess(''); }}>
                <option value="">Select user…</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.first_name} {u.last_name} · {u.role}</option>
                ))}
              </select>
            </div>
          </div>
          {!conflictAsset && (
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing…' : 'Allocate Asset'}
            </button>
          )}
        </form>
      </div>

      {/* Conflict banner + Transfer form */}
      {conflictAsset && (
        <div className="animate-fade-in">
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            <strong>Conflict — Already allocated</strong>
            <div style={{ marginTop: '4px', fontWeight: 400 }}>
              {conflictAsset.asset?.name} is currently held by <strong>{conflictAsset.owner ? `${conflictAsset.owner.first_name} ${conflictAsset.owner.last_name}` : 'another user'}</strong>. Direct re-allocation is blocked. Submit a transfer request instead.
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Submit Transfer Request</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Current Holder</label>
                <input
                  type="text"
                  className="input-field"
                  value={conflictAsset.owner ? `${conflictAsset.owner.first_name} ${conflictAsset.owner.last_name}` : 'Unknown User'}
                  disabled
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Transfer To</label>
                <input
                  type="text"
                  className="input-field"
                  value={toUser ? `${toUser.first_name} ${toUser.last_name}` : '—'}
                  disabled
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Reason for Transfer</label>
              <textarea className="input-field" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Briefly describe the reason…" />
            </div>
            <button className="btn btn-primary" onClick={handleTransfer} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Transfer Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
