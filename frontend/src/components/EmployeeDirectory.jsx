import { useState, useEffect } from 'react';
import { api } from '../api';

export default function EmployeeDirectory({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePromote = async (userId, newRole) => {
    try {
      await api.promoteUser(userId, newRole);
      // Reload users to see the new role
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Employee Directory</h2>
      {loading ? <p>Loading directory...</p> : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {users.map(user => (
            <div key={user.id} className="glass-card flex items-center justify-between" style={{ padding: '1.5rem', gap: '1rem' }}>
              <div className="flex items-center" style={{ gap: '1rem' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%', 
                  background: 'var(--primary)', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 'bold', flexShrink: 0
                }}>
                  {user.first_name[0]}{user.last_name[0]}
                </div>
                <div>
                  <strong style={{ fontSize: '1.1rem' }}>{user.first_name} {user.last_name}</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className="badge badge-allocated">{user.role}</span>
                  </div>
                </div>
              </div>
              
              {/* PDF Requirement: Admin promotes an Employee to Department Head or Asset Manager */}
              {currentUser?.role === 'ADMIN' && user.role !== 'ADMIN' && (
                <select 
                  className="input-field" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                  value={user.role}
                  onChange={(e) => handlePromote(user.id, e.target.value)}
                >
                  <option value="EMPLOYEE">Demote to Employee</option>
                  <option value="ASSET_MANAGER">Promote: Asset Manager</option>
                  <option value="DEPARTMENT_HEAD">Promote: Dept Head</option>
                </select>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
