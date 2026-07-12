import { useState } from 'react'
import BookingCalendar from './components/BookingCalendar'
import MaintenanceWorkflow from './components/MaintenanceWorkflow'

function App() {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div className="container animate-fade-in">
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>AssetFlow Operations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your resources, bookings, and maintenance seamlessly.</p>
        </div>
        
        <div className="glass-card flex" style={{ padding: '0.5rem', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('bookings')}
          >
            🗓️ Booking Calendar
          </button>
          <button 
            className={`btn ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('maintenance')}
          >
            🔧 Maintenance
          </button>
        </div>
      </header>

      <main className="glass-panel" style={{ padding: '2rem', minHeight: '600px' }}>
        {activeTab === 'bookings' ? <BookingCalendar /> : <MaintenanceWorkflow />}
      </main>
    </div>
  )
}

export default App
