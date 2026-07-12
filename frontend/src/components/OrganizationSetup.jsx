import { useState } from 'react';
import EmployeeDirectory from './EmployeeDirectory';
import DepartmentList from './DepartmentList';

export default function OrganizationSetup({ currentUser }) {
  const [activeTab, setActiveTab] = useState('departments');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2 className="page-title">Organization Setup</h2>
      </div>

      <div className="tab-nav">
        <button className={`tab-btn ${activeTab === 'departments' ? 'active' : ''}`} onClick={() => setActiveTab('departments')}>Departments</button>
        <button className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categories</button>
        <button className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveTab('employees')}>Employees</button>
      </div>

      {activeTab === 'employees'   && <EmployeeDirectory currentUser={currentUser} />}
      {activeTab === 'departments' && <DepartmentList />}
      {activeTab === 'categories'  && (
        <div className="empty-state glass-card" style={{ padding: '3rem' }}>Category management coming soon.</div>
      )}
    </div>
  );
}
