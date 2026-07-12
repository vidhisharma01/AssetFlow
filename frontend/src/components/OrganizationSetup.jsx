import { useState } from 'react';
import EmployeeDirectory from './EmployeeDirectory';

export default function OrganizationSetup({ currentUser }) {
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Organization Setup</h2>
      
      <div className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button 
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
          onClick={() => setActiveTab('employees')}
        >
          Employee
        </button>
        <button className="tab-btn" style={{ marginLeft: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
          + Add
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'employees' && <EmployeeDirectory currentUser={currentUser} />}
        
        {activeTab === 'departments' && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Department management coming soon (Placeholder for Mockup 3)</p>
          </div>
        )}
        
        {activeTab === 'categories' && (
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Category management coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
