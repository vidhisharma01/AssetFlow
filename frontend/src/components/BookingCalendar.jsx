import { useState, useEffect } from 'react';
import { api } from '../api';

export default function BookingCalendar() {
  const [assets, setAssets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  
  // New Booking Form State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [overlapWarning, setOverlapWarning] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAssetId) {
      loadBookings(selectedAssetId);
    }
  }, [selectedAssetId]);

  const loadData = async () => {
    try {
      const data = await api.getAssets();
      setAssets(data);
      if (data.length > 0) {
        setSelectedAssetId(data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (assetId) => {
    try {
      const data = await api.getBookings(assetId);
      setBookings(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Local overlap check
  useEffect(() => {
    if (!startTime || !endTime) {
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
      if (['REJECTED', 'CANCELLED'].includes(b.status)) return false;
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();
      return (newStart < bEnd && newEnd > bStart);
    });

    if (conflicting) {
      setOverlapWarning(`Requested time creates a conflict with an existing booking.`);
    } else {
      setOverlapWarning(null);
    }
  }, [startTime, endTime, bookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (overlapWarning && overlapWarning.includes('conflict')) {
      alert("Cannot book: Fix the overlap first.");
      return;
    }

    try {
      await api.createBooking({
        asset_id: parseInt(selectedAssetId),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        purpose
      });
      loadBookings(selectedAssetId);
      setStartTime('');
      setEndTime('');
      setPurpose('');
      alert("Booking successful!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Resource Booking</h2>
        <select
          className="input-field"
          style={{ width: '260px' }}
          value={selectedAssetId}
          onChange={e => setSelectedAssetId(e.target.value)}
        >
          {assets.map(a => (
            <option key={a.id} value={a.id}>{a.name} · {a.serial_number}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>

        {/* Timeline */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>Today's Timeline</h3>
          <div style={{ position: 'relative', minHeight: '360px', borderLeft: '1px solid var(--border)', marginLeft: '48px' }}>
            {[9,10,11,12,13,14,15,16,17].map((hour, idx) => (
              <div key={hour} style={{ position: 'absolute', top: `${idx * 12.5}%`, left: '-48px', width: 'calc(100% + 48px)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ position: 'absolute', top: '-9px', left: '0', fontSize: '0.6875rem', color: 'var(--text-muted)', width: '38px' }}>
                  {hour > 12 ? `${hour-12}pm` : `${hour}am`}
                </span>
              </div>
            ))}

            {bookings.filter(b => !['REJECTED','CANCELLED'].includes(b.status)).map(b => {
              const s = new Date(b.start_time); const e_ = new Date(b.end_time);
              const top = Math.max(0, (s.getHours() + s.getMinutes()/60 - 9) * 12.5);
              const h   = (e_.getHours() + e_.getMinutes()/60 - s.getHours() - s.getMinutes()/60) * 12.5;
              return (
                <div key={b.id} style={{
                  position: 'absolute', top: `${top}%`, height: `${Math.max(h, 3)}%`,
                  left: '8px', right: '8px',
                  background: 'var(--accent-dim)', border: '1px solid var(--accent)',
                  borderRadius: '4px', padding: '4px 8px',
                  fontSize: '0.6875rem', color: 'var(--accent-hover)', overflow: 'hidden', zIndex: 10,
                }}>
                  {s.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} – {e_.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                </div>
              );
            })}

            {overlapWarning?.includes('conflict') && startTime && endTime && (() => {
              const s = new Date(startTime); const e_ = new Date(endTime);
              const top = Math.max(0, (s.getHours() + s.getMinutes()/60 - 9) * 12.5);
              const h   = (e_.getHours() + e_.getMinutes()/60 - s.getHours() - s.getMinutes()/60) * 12.5;
              return (
                <div style={{
                  position: 'absolute', top: `${top}%`, height: `${Math.max(h, 3)}%`,
                  left: '8px', right: '8px',
                  background: 'var(--s-red-bg)', border: '1.5px dashed var(--s-red)',
                  borderRadius: '4px', padding: '4px 8px',
                  fontSize: '0.6875rem', color: 'var(--s-red)', overflow: 'hidden', zIndex: 20,
                }}>
                  Conflict — unavailable
                </div>
              );
            })()}
          </div>
        </div>

        {/* Booking form */}
        <div className="glass-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem' }}>Book a Slot</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Start Time</label>
              <input type="datetime-local" className="input-field" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">End Time</label>
              <input type="datetime-local" className="input-field" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Purpose (Optional)</label>
              <input type="text" className="input-field" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Field survey" />
            </div>

            {overlapWarning && (
              <div className={`alert ${overlapWarning.includes('conflict') ? 'alert-error' : 'alert-warning'}`}>
                {overlapWarning}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={!!overlapWarning?.includes('conflict')}>
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
