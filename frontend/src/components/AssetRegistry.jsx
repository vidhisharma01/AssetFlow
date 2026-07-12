import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AssetRegistry() {
  const [assets, setAssets]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]   = useState('');

  const [name, setName]             = useState('');
  const [serialNumber, setSerial]   = useState('');
  const [assetTag, setTag]          = useState('');
  const [department, setDepartment] = useState('IT');
  const [formErr, setFormErr]       = useState('');

  useEffect(() => { loadAssets(); }, []);

  const loadAssets = async () => {
    try { setAssets(await api.getAssets()); }
    catch {}
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormErr('');
    try {
      await api.createAsset({ name, serial_number: serialNumber, asset_tag: assetTag, department, location: 'HQ', category_id: 1 });
      setName(''); setSerial(''); setTag(''); setShowForm(false);
      loadAssets();
    } catch (err) { setFormErr(err.message); }
  };

  const filtered = assets.filter(a =>
    [a.name, a.asset_tag, a.serial_number].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const statusLabel = (s) => {
    if (!s) return 'unknown';
    return s.toLowerCase();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Asset Registry</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(f => !f)}>
          {showForm ? 'Cancel' : '+ Register Asset'}
        </button>
      </div>

      {/* Register form */}
      {showForm && (
        <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Register New Asset</h3>
          {formErr && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{formErr}</div>}
          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Asset Name</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Serial Number</label>
                <input type="text" className="input-field" value={serialNumber} onChange={e => setSerial(e.target.value)} required />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Asset Tag</label>
                <input type="text" className="input-field" value={assetTag} onChange={e => setTag(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Submit Registration</button>
          </form>
        </div>
      )}

      {/* Search bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          className="input-field"
          style={{ maxWidth: '360px' }}
          placeholder="Search by name, tag, or serial…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="animate-pulse">Loading assets…</p>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Serial Number</th>
                <th>Department</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">No assets found</td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td><span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{a.asset_tag || '—'}</span></td>
                  <td style={{ fontWeight: 500 }}>{a.name}</td>
                  <td><span className="font-mono text-sm">{a.serial_number}</span></td>
                  <td>{a.department || '—'}</td>
                  <td><span className={`badge badge-${statusLabel(a.status)}`}>{a.status}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.location || 'Warehouse'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
