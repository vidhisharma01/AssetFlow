import { useState, useEffect } from 'react';
import { api } from '../api';

export default function AssetRegistry() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [department, setDepartment] = useState('IT');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      const data = await api.getAssets();
      setAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.createAsset({
        name,
        serial_number: serialNumber,
        asset_tag: assetTag,
        department,
        location: 'HQ',
        category_id: 1
      });
      loadAssets();
      setName('');
      setSerialNumber('');
      setAssetTag('');
      setShowRegisterForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Assets</h2>
      
      {/* Mockup 4 Header Area */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search by tag, serial, or QR code.." 
          style={{ width: '400px' }}
        />
        <button 
          className="btn btn-primary" 
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'white' }}
        >
          + Register Asset
        </button>
      </div>

      <div className="flex" style={{ gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary">Category</button>
        <button className="btn btn-secondary">Status</button>
        <button className="btn btn-secondary">Department</button>
      </div>

      {showRegisterForm && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Register New Asset</h3>
          <form onSubmit={handleRegister} className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Asset Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Serial Number</label>
              <input type="text" className="input-field" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Asset Tag</label>
              <input type="text" className="input-field" value={assetTag} onChange={e => setAssetTag(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1' }}>Submit Registration</button>
          </form>
        </div>
      )}

      {loading ? <p>Loading assets...</p> : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem 1.5rem' }}>Tag</th>
                <th style={{ padding: '1rem 1.5rem' }}>Name</th>
                <th style={{ padding: '1rem 1.5rem' }}>Category</th>
                <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace' }}>{asset.asset_tag}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{asset.name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{asset.category_id === 1 ? 'Electronics' : 'Furniture'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${asset.status.toLowerCase()}`}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>{asset.location || 'Warehouse'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
