import { useState, useEffect } from 'react';
import { api } from '../api';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createDepartment({ name, code });
      setName('');
      setCode('');
      setShowAdd(false);
      loadDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="animate-pulse">Loading departments...</p>;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Departments</h3>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Department'}
        </button>
      </div>

      {showAdd && (
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <form onSubmit={handleCreate} className="grid" style={{ gridTemplateColumns: '1fr 1fr auto', alignItems: 'end' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Department Name</label>
              <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Department Code</label>
              <input type="text" className="input-field" value={code} onChange={e => setCode(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Save</button>
          </form>
        </div>
      )}

      {error && <div style={{ color: 'var(--status-rejected-text)', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-hover)' }}>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Code</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Head</th>
              <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No departments found</td></tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>{dept.code}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{dept.name}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>-</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
