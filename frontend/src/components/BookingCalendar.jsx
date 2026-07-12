import { useState, useEffect } from 'react';
import { api } from '../api';

export default function BookingCalendar() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // New Booking Form State
  const [assetId, setAssetId] = useState('1');
  const [userId, setUserId] = useState('1');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [overlapWarning, setOverlapWarning] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check for overlap locally before submitting
  useEffect(() => {
    if (!startTime || !endTime || !assetId) {
      setOverlapWarning(null);
      return;
    }

    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    if (newStart >= newEnd) {
      setOverlapWarning("End time must be after start time");
      return;
    }

    const conflicting = bookings.find(b => {
      if (b.asset_id.toString() !== assetId) return false;
      if (['REJECTED', 'CANCELLED', 'COMPLETED'].includes(b.status)) return false;
      
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      
      return (newStart < bEnd && newEnd > bStart);
    });

    if (conflicting) {
      setOverlapWarning(`⚠️ Overlaps with an existing ${conflicting.status.toLowerCase()} booking (ID: ${conflicting.id})`);
    } else {
      setOverlapWarning(null);
    }
  }, [startTime, endTime, assetId, bookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (overlapWarning && overlapWarning.includes('Overlaps')) {
      alert("Cannot book: Fix the overlap first.");
      return;
    }

    try {
      await api.createBooking({
        asset_id: parseInt(assetId),
        user_id: parseInt(userId),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        purpose
      });
      loadBookings();
      setStartTime('');
      setEndTime('');
      setPurpose('');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
      
      {/* Left Column: Bookings Timeline/List */}
      <div>
        <h2 style={{ marginBottom: '1.5rem' }}>Current Bookings</h2>
        
        {loading ? <p className="animate-pulse">Loading calendar data...</p> : (
          <div className="flex flex-col" style={{ gap: '1rem' }}>
            {error && <div style={{ color: 'var(--status-rejected-text)' }}>{error}</div>}
            
            {bookings.length === 0 && !loading && (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
                No active bookings found.
              </div>
            )}

            {bookings.map(booking => (
              <div key={booking.id} className="glass-card flex justify-between items-center" style={{ padding: '1rem' }}>
                <div>
                  <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <strong>Asset #{booking.asset_id}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>• User #{booking.user_id}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {new Date(booking.start_time).toLocaleString()} — {new Date(booking.end_time).toLocaleString()}
                  </div>
                  {booking.purpose && <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>"{booking.purpose}"</div>}
                </div>
                
                <span className={`badge badge-${booking.status.toLowerCase().replace('_', '')}`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: New Booking Form */}
      <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>New Booking</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Asset ID</label>
            <input 
              type="number" 
              className="input-field" 
              value={assetId} 
              onChange={e => setAssetId(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">User ID</label>
            <input 
              type="number" 
              className="input-field" 
              value={userId} 
              onChange={e => setUserId(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Start Time</label>
            <input 
              type="datetime-local" 
              className="input-field" 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">End Time</label>
            <input 
              type="datetime-local" 
              className="input-field" 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label">Purpose (Optional)</label>
            <input 
              type="text" 
              className="input-field" 
              value={purpose} 
              onChange={e => setPurpose(e.target.value)} 
              placeholder="e.g. Field Survey"
            />
          </div>
          
          {overlapWarning && (
            <div style={{ 
              color: overlapWarning.includes('⚠️') ? 'var(--status-rejected-text)' : 'inherit',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              padding: '0.5rem',
              background: overlapWarning.includes('⚠️') ? 'rgba(239,68,68,0.1)' : 'transparent',
              borderRadius: '4px'
            }}>
              {overlapWarning}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={overlapWarning?.includes('⚠️')}>
            Book Asset
          </button>
        </form>
      </div>

    </div>
  );
}
