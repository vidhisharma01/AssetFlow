import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AssetAudit() {
  const [cycles, setCycles]     = useState([]);
  const [active, setActive]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [cycleName, setCycleName] = useState('');
  const [endDate, setEndDate]   = useState('');

  useEffect(() => { loadCycles(); }, []);

  const loadCycles = async () => {
    try { setCycles(await api.getAuditCycles()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const createCycle = async (e) => {
    e.preventDefault();
    try {
      await api.createAuditCycle({
        name: cycleName,
        start_date: new Date().toISOString().split('T')[0],
        end_date: endDate,
      });
      setCycleName(''); setEndDate(''); setShowForm(false);
      loadCycles();
    } catch (e) { alert(e.message); }
  };

  const openCycle = async (id) => {
    setLoading(true);
    try {
      const data   = await api.getAuditCycle(id);
      const assets = await api.getAssets();
      data.items   = data.items.map(item => {
        const a = assets.find(a => a.id === item.asset_id);
        return { ...item, asset_name: a?.name || `Asset #${item.asset_id}`, asset_tag: a?.asset_tag || '—' };
      });
      setActive(data);
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  const verify = async (itemId, status) => {
    try {
      await api.verifyAuditItem(active.id, itemId, { status, verified_by_id: 1, notes: '' });
      openCycle(active.id);
    } catch (e) { alert(e.message); }
  };

  const closeCycle = async () => {
    if (!confirm('Close this audit cycle? Missing assets will be marked LOST.')) return;
    try { await api.closeAuditCycle(active.id); setActive(null); loadCycles(); }
    catch (e) { alert(e.message); }
  };

  /* ── Detail view ──────────────────────────────── */
  if (active) return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActive(null)}>← Back</button>
          <h2 className="page-title">{active.name}</h2>
          <span className={`badge badge-${active.status.toLowerCase()}`}>{active.status}</span>
        </div>
        {active.status !== 'completed' && (
          <button className="btn btn-danger" onClick={closeCycle}>Close Cycle</button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Asset</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {active.items.map(item => (
              <tr key={item.id}>
                <td className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{item.asset_tag}</td>
                <td style={{ fontWeight: 500 }}>{item.asset_name}</td>
                <td><span className={`badge badge-${item.status.toLowerCase()}`}>{item.status}</span></td>
                <td style={{ textAlign: 'right' }}>
                  {active.status !== 'completed' && item.status === 'unverified' && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-sm"
                        style={{ color: 'var(--s-green)', borderColor: 'rgba(74,222,128,0.3)', background: 'var(--s-green-bg)' }}
                        onClick={() => verify(item.id, 'verified')}
                      >
                        Verify
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ color: 'var(--s-red)', borderColor: 'rgba(248,113,113,0.3)', background: 'var(--s-red-bg)' }}
                        onClick={() => verify(item.id, 'missing')}
                      >
                        Missing
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ── List view ─────────────────────────────────── */
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Asset Audits</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>
          {showForm ? 'Cancel' : '+ Start New Audit'}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>New Audit Cycle</h3>
          <form onSubmit={createCycle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Cycle Name</label>
                <input type="text" className="input-field" value={cycleName} onChange={e => setCycleName(e.target.value)} required placeholder="e.g. Q3 Hardware Audit" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">End Date</label>
                <input type="date" className="input-field" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Audit Cycle</button>
          </form>
        </div>
      )}

      {loading ? <p className="animate-pulse">Loading audits…</p> : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Period</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {cycles.length === 0 ? (
                <tr><td colSpan="4" className="empty-state">No audit cycles created yet.</td></tr>
              ) : cycles.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td className="text-muted text-sm">{c.start_date} → {c.end_date}</td>
                  <td><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openCycle(c.id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
