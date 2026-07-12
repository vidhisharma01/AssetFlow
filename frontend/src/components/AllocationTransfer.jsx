export default function AllocationTransfer() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Allocation & Transfer</h2>
      
      <div className="input-group">
        <label className="input-label">Asset</label>
        <select className="input-field">
          <option>AF-0114 - Dell laptop</option>
          <option>AF-0062 - Projector</option>
        </select>
      </div>

      <div style={{ 
        padding: '1rem', 
        background: 'rgba(239, 68, 68, 0.1)', 
        border: '1px solid var(--status-rejected-border)',
        borderRadius: '8px',
        color: 'var(--status-rejected-text)',
        marginBottom: '2rem'
      }}>
        <strong>Already Allocated to Priya shah (Engineering)</strong><br />
        Direct re-allocation is blocked - submit a transfer request below
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Transfer Request</h3>
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div className="input-group">
            <label className="input-label">From</label>
            <input type="text" className="input-field" value="Priya Shah" disabled />
          </div>
          <div className="input-group">
            <label className="input-label">To</label>
            <select className="input-field">
              <option>Select Employee...</option>
            </select>
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Reason</label>
          <textarea className="input-field" rows="4"></textarea>
        </div>
        
        <button className="btn btn-secondary" style={{ marginTop: '1rem', borderColor: 'var(--status-approved-text)', color: 'var(--status-approved-text)' }}>
          Submit Request
        </button>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          Allocation history
        </h4>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8' }}>
          Mar 12 - Allocated to Priya shah - Engineering<br/>
          Jan 04 - Returned by Arjun Nair - condition: good
        </div>
      </div>
    </div>
  );
}
