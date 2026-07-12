import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Reports() {
  const [utilization, setUtilization] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [u, m] = await Promise.all([api.getUtilizationReport(), api.getMaintenanceReport()]);
      setUtilization(u); setMaintenance(m);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (loading) return <p className="animate-pulse" style={{ padding: '1rem' }}>Loading reports…</p>;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Analytics &amp; Reports</h2>
        <a
          href="http://localhost:8000/api/v1/insights/reports/export/csv"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary"
        >
          Export CSV
        </a>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <ReportTable
          title="Asset Utilization"
          subtitle="Ranked by lifetime allocations"
          rows={utilization.slice(0, 10)}
          colA="Asset"
          colB="Allocations"
          getA={r => r.asset_name}
          getB={r => <span className="badge badge-allocated">{r.allocation_count}</span>}
        />
        <ReportTable
          title="Maintenance Frequency"
          subtitle="Assets with most issues"
          rows={maintenance.slice(0, 10)}
          colA="Asset"
          colB="Issues"
          getA={r => r.asset_name}
          getB={r => <span className="badge badge-rejected">{r.maintenance_count}</span>}
        />
      </div>
    </div>
  );
}

function ReportTable({ title, subtitle, rows, colA, colB, getA, getB }) {
  return (
    <div className="glass-card overflow-hidden">
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '2px' }}>{title}</h3>
        <p className="text-muted text-sm">{subtitle}</p>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>{colA}</th>
            <th style={{ textAlign: 'right' }}>{colB}</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan="2" className="empty-state">No data available</td></tr>
          ) : rows.map((r, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500 }}>{getA(r)}</td>
              <td style={{ textAlign: 'right' }}>{getB(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
