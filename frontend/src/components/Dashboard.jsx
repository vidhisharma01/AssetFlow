import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await api.getDashboardKPIs();
      setKpi(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="animate-pulse">Loading dashboard metrics...</p>;
  if (error) return <div style={{ color: 'var(--status-rejected-text)' }}>{error}</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Overview Dashboard</h2>
      
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
            {(kpi.assets_available || 0) + (kpi.assets_allocated || 0)}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Total Assets</div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--status-allocated-text)' }}>
            {kpi.assets_allocated || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Allocated</div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--status-pending-text)' }}>
            {kpi.maintenance_today || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Under Maintenance</div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--status-approved-text)' }}>
            {kpi.active_bookings || 0}
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>Active Bookings</div>
        </div>

      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--status-rejected-text)' }}>Overdue Returns</h3>
        {kpi.overdue_returns === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No overdue assets found. You are all caught up!</p>
        ) : (
          <p>⚠️ {kpi.overdue_returns} assets overdue for return - flagged for follow-up</p>
        )}
      </div>

      {/* Quick Actions (Mockup 2) */}
      <div className="flex" style={{ gap: '1rem', marginBottom: '3rem' }}>
        <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }}>+ register asset</button>
        <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }}>Book resource</button>
        <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }}>Raise requests</button>
      </div>

      {/* Recent Activity (Mockup 2) */}
      <div>
        <h2 style={{ marginBottom: '1.5rem' }}>Recent Activity</h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          Laptop AF-0114 - allocated to Priya shah - IT dept<br/>
          Room B2 - booking confirmed - 2:00 to 3:00 PM<br/>
          Projector AF-0062 - maintenance resolved
        </div>
      </div>

    </div>
  );
}
