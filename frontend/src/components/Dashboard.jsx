import { useState, useEffect } from 'react';
import { api } from '../api';

const ICONS = {
  total:       '▪',
  allocated:   '▪',
  maintenance: '▪',
  bookings:    '▪',
  overdue:     '▪',
};

export default function Dashboard({ setActiveTab }) {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadKPIs(); }, []);

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

  if (loading) return <p className="animate-pulse" style={{ padding: '2rem' }}>Loading metrics…</p>;
  if (error)   return <div className="alert alert-error" style={{ margin: '1rem 0' }}>{error}</div>;

  const total = (kpi.assets_available || 0) + (kpi.assets_allocated || 0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
      </div>

      {/* KPI row */}
      <div className="kpi-grid">
        <KPICard value={total}                      label="Total Assets"       />
        <KPICard value={kpi.assets_available || 0}  label="Available"          accent="var(--s-green)"  />
        <KPICard value={kpi.assets_allocated || 0}  label="Allocated"          accent="var(--s-blue)"   />
        <KPICard value={kpi.maintenance_today || 0} label="Under Maintenance"  accent="var(--s-orange)" />
        <KPICard value={kpi.active_bookings || 0}   label="Active Bookings"    accent="var(--s-purple)" />
        {kpi.overdue_returns > 0 && (
          <KPICard value={kpi.overdue_returns} label="Overdue Returns" accent="var(--s-red)" />
        )}
      </div>

      {/* Overdue alert */}
      {kpi.overdue_returns > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          {kpi.overdue_returns} asset{kpi.overdue_returns > 1 ? 's are' : ' is'} overdue for return — flagged for follow-up.
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => setActiveTab('assets')}>+ Register Asset</button>
        <button className="btn btn-secondary" onClick={() => setActiveTab('bookings')}>Book Resource</button>
        <button className="btn btn-secondary" onClick={() => setActiveTab('maintenance')}>Raise Maintenance Request</button>
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <PendingTransfers />
        <RecentActivity />
      </div>
    </div>
  );
}

function KPICard({ value, label, accent }) {
  return (
    <div className="kpi-card">
      <div className="kpi-value" style={accent ? { color: accent } : {}}>{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function RecentActivity() {
  const items = [
    { text: 'Laptop AF-0114 allocated', sub: 'IT Dept · just now' },
    { text: 'Room B2 booking confirmed', sub: '2:00–3:00 PM · Today' },
    { text: 'Projector AF-0062 maintenance resolved', sub: '1 hour ago' },
  ];
  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Recent Activity</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{item.text}</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = async () => {
    try { setTransfers(await api.getPendingTransfers()); }
    catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const approve = async (id) => {
    try { await api.approveTransfer(id); fetch_(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pending Transfers</h3>
      {loading ? (
        <p className="animate-pulse">Loading…</p>
      ) : transfers.length === 0 ? (
        <p className="text-muted text-sm">No pending transfers.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {transfers.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Transfer Request #{t.id}</div>
                <div className="text-muted text-sm">Asset #{t.asset_id} · from User #{t.from_user_id}</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => approve(t.id)}>Accept</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
