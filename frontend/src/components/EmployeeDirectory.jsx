import { useState, useEffect } from 'react';
import { api } from '../api';

export default function EmployeeDirectory({ currentUser }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try { setUsers(await api.getUsers()); }
    catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const handlePromote = async (userId, newRole) => {
    try { await api.promoteUser(userId, newRole); loadUsers(); }
    catch (e) { alert(e.message); }
  };

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  const initials = (u) => `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div>
      {loading ? <p className="animate-pulse">Loading directory…</p> : (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Role</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Manage Role</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--accent-dim)', border: '1px solid var(--border)',
                        color: 'var(--accent-hover)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0,
                      }}>
                        {initials(u)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</span>
                    </div>
                  </td>
                  <td className="text-muted text-sm">{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role?.toLowerCase() || 'employee'}`}>
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      {u.role?.toLowerCase() !== 'admin' && (
                        <select
                          className="input-field"
                          style={{ width: 'auto', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          value={u.role?.toUpperCase()}
                          onChange={e => handlePromote(u.id, e.target.value)}
                        >
                          <option value="EMPLOYEE">Employee</option>
                          <option value="ASSET_MANAGER">Asset Manager</option>
                          <option value="DEPARTMENT_HEAD">Dept Head</option>
                        </select>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
