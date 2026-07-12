import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AssetRegistry from './components/AssetRegistry';
import OrganizationSetup from './components/OrganizationSetup';
import AllocationTransfer from './components/AllocationTransfer';
import BookingCalendar from './components/BookingCalendar';
import MaintenanceWorkflow from './components/MaintenanceWorkflow';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Check for existing session on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'EMPLOYEE') {
        setActiveTab('bookings');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    if (userData.role === 'EMPLOYEE') {
      setActiveTab('bookings');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Render the currently active component
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'orgsetup': return <OrganizationSetup currentUser={user} />;
      case 'assets': return <AssetRegistry />;
      case 'allocation': return <AllocationTransfer />;
      case 'bookings': return <BookingCalendar />;
      case 'maintenance': return <MaintenanceWorkflow />;
      case 'audit': return <div className="glass-card" style={{padding: '2rem'}}>Audit module coming soon</div>;
      case 'reports': return <div className="glass-card" style={{padding: '2rem'}}>Reports module coming soon</div>;
      case 'notifications': return <div className="glass-card" style={{padding: '2rem'}}>Notifications module coming soon</div>;
      default: return <Dashboard />;
    }
  };

  // If not logged in, only render the Login screen
  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // Main Authenticated Dashboard - Sidebar Layout
  return (
    <div className="app-layout animate-fade-in">
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>AssetFlow</h1>
        
        <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
          <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
            {user?.first_name} {user?.last_name}
          </p>
          <span className={`badge badge-${user?.role?.toLowerCase() || 'employee'}`} style={{ marginTop: '0.5rem' }}>
            {user?.role}
          </span>
        </div>

        <nav className="sidebar-nav">
          {/* Admin & Manager Only Tabs */}
          {user?.role !== 'EMPLOYEE' && (
            <>
              <button className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                Dashboard
              </button>
              
              {user?.role === 'ADMIN' && (
                <button className={`sidebar-btn ${activeTab === 'orgsetup' ? 'active' : ''}`} onClick={() => setActiveTab('orgsetup')}>
                  Organization setup
                </button>
              )}

              <button className={`sidebar-btn ${activeTab === 'assets' ? 'active' : ''}`} onClick={() => setActiveTab('assets')}>
                Assets
              </button>
              <button className={`sidebar-btn ${activeTab === 'allocation' ? 'active' : ''}`} onClick={() => setActiveTab('allocation')}>
                Allocation & Transfer
              </button>
            </>
          )}

          {/* Universal Tabs */}
          <button className={`sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            Resource Booking
          </button>
          <button className={`sidebar-btn ${activeTab === 'maintenance' ? 'active' : ''}`} onClick={() => setActiveTab('maintenance')}>
            Maintenance
          </button>
          
          {/* Admin Only Tabs */}
          {user?.role === 'ADMIN' && (
            <>
              <button className={`sidebar-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
                Audit
              </button>
              <button className={`sidebar-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                Reports
              </button>
            </>
          )}

          {/* Universal Nav Items */}
          <button className={`sidebar-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            Notifications
          </button>
        </nav>

        <button 
          className="sidebar-btn" 
          onClick={handleLogout}
          style={{ color: 'var(--status-rejected-text)', marginTop: 'auto' }}
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {renderContent()}
      </main>

    </div>
  );
}

