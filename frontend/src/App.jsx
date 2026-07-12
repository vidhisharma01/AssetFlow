import { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AssetRegistry from './components/AssetRegistry';
import OrganizationSetup from './components/OrganizationSetup';
import AllocationTransfer from './components/AllocationTransfer';
import BookingCalendar from './components/BookingCalendar';
import MaintenanceWorkflow from './components/MaintenanceWorkflow';
import AssetAudit from './components/AssetAudit';
import Reports from './components/Reports';
import ActivityLogs from './components/ActivityLogs';

const NAV_ADMIN = [
  { id: 'dashboard',    label: 'Dashboard'           },
  { id: 'orgsetup',     label: 'Organization',  adminOnly: true },
  { id: 'assets',       label: 'Assets'              },
  { id: 'allocation',   label: 'Allocation & Transfer' },
];

const NAV_COMMON = [
  { id: 'bookings',     label: 'Resource Booking'    },
  { id: 'maintenance',  label: 'Maintenance'         },
];

const NAV_INSIGHTS = [
  { id: 'audit',        label: 'Audits'              },
  { id: 'reports',      label: 'Reports'             },
  { id: 'logs',         label: 'Activity Logs'       },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]         = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token      = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      const u = JSON.parse(storedUser);
      setUser(u);
      setActiveTab(u.role?.toLowerCase() === 'employee' ? 'bookings' : 'dashboard');
    }
  }, []);

  const handleLoginSuccess = (u) => {
    setIsAuthenticated(true);
    setUser(u);
    setActiveTab(u.role?.toLowerCase() === 'employee' ? 'bookings' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':   return <Dashboard setActiveTab={setActiveTab} />;
      case 'orgsetup':    return <OrganizationSetup currentUser={user} />;
      case 'assets':      return <AssetRegistry />;
      case 'allocation':  return <AllocationTransfer />;
      case 'bookings':    return <BookingCalendar />;
      case 'maintenance': return <MaintenanceWorkflow />;
      case 'audit':       return <AssetAudit />;
      case 'reports':     return <Reports />;
      case 'logs':        return <ActivityLogs />;
      default:            return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const role = user?.role?.toLowerCase();
  const isAdmin    = role === 'admin';
  const isEmployee = role === 'employee';

  const NavBtn = ({ id, label }) => (
    <button
      className={`sidebar-btn${activeTab === id ? ' active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );

  return (
    <div className="app-layout animate-fade-in">
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-header">
          <span className="sidebar-brand">AssetFlow</span>
        </div>

        {/* User info */}
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user?.first_name} {user?.last_name}</div>
          <span className={`badge badge-${role || 'employee'}`}>
            {user?.role?.replace('_', ' ')}
          </span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {!isEmployee && (
            <>
              <span className="sidebar-section-label">Management</span>
              {NAV_ADMIN.filter(n => !n.adminOnly || isAdmin).map(n => (
                <NavBtn key={n.id} {...n} />
              ))}
            </>
          )}

          <span className="sidebar-section-label">Operations</span>
          {NAV_COMMON.map(n => <NavBtn key={n.id} {...n} />)}

          {isAdmin && (
            <>
              <span className="sidebar-section-label">Insights</span>
              {NAV_INSIGHTS.map(n => <NavBtn key={n.id} {...n} />)}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className="btn btn-secondary w-full"
            style={{ justifyContent: 'flex-start', color: 'var(--s-red)', borderColor: 'transparent' }}
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
