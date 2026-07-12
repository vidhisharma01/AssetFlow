const API_BASE_URL = 'http://localhost:8000/api/v1/operations';

// Dynamic header generation
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // --- Bookings ---
  async getBookings(assetId = null) {
    const url = assetId ? `${API_BASE_URL}/bookings?asset_id=${assetId}` : `${API_BASE_URL}/bookings`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async createBooking(bookingData) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to create booking');
    }
    return response.json();
  },

  // --- Maintenance Requests ---
  async getMaintenanceRequests(assetId = null) {
    const url = assetId ? `${API_BASE_URL}/maintenance?asset_id=${assetId}` : `${API_BASE_URL}/maintenance`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch maintenance requests');
    return response.json();
  },

  async createMaintenanceRequest(requestData) {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to report maintenance');
    }
    return response.json();
  },

  async updateMaintenanceStatus(id, updateData) {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to update maintenance status');
    }
    return response.json();
  },

  // --- Insights Dashboard ---
  async getDashboardKPIs() {
    const response = await fetch('http://localhost:8000/api/v1/insights/dashboard/kpi', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load KPIs');
    return response.json();
  },

  // --- Assets ---
  async getAssets() {
    const response = await fetch('http://localhost:8000/api/v1/assets/', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load assets');
    return response.json();
  },

  async createAsset(assetData) {
    const response = await fetch('http://localhost:8000/api/v1/assets/', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assetData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to register asset');
    }
    return response.json();
  },

  async getPendingTransfers() {
    const response = await fetch('http://localhost:8000/api/v1/assets/transfers/pending', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load pending transfers');
    return response.json();
  },

  async approveTransfer(transferId) {
    const response = await fetch(`http://localhost:8000/api/v1/assets/transfers/${transferId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to approve transfer');
    }
    return response.json();
  },

  // --- Audits ---
  async getAuditCycles() {
    const response = await fetch('http://localhost:8000/api/v1/insights/audits', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load audit cycles');
    return response.json();
  },

  async createAuditCycle(cycleData) {
    const response = await fetch('http://localhost:8000/api/v1/insights/audits', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cycleData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to create audit cycle');
    }
    return response.json();
  },

  async getAuditCycle(cycleId) {
    const response = await fetch(`http://localhost:8000/api/v1/insights/audits/${cycleId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load audit cycle');
    return response.json();
  },

  async verifyAuditItem(cycleId, itemId, data) {
    const response = await fetch(`http://localhost:8000/api/v1/insights/audits/${cycleId}/items/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to verify item');
    }
    return response.json();
  },

  async closeAuditCycle(cycleId) {
    const response = await fetch(`http://localhost:8000/api/v1/insights/audits/${cycleId}/close`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to close audit cycle');
    }
    return response.json();
  },

  // --- Analytics & Reports ---
  async getUtilizationReport() {
    const response = await fetch('http://localhost:8000/api/v1/insights/reports/utilization', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load utilization report');
    return response.json();
  },

  async getMaintenanceReport() {
    const response = await fetch('http://localhost:8000/api/v1/insights/reports/maintenance', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load maintenance report');
    return response.json();
  },

  async getActivityLogs(limit = 100) {
    const response = await fetch(`http://localhost:8000/api/v1/insights/activity-logs?limit=${limit}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load activity logs');
    return response.json();
  },

  // --- Identity / Users ---
  async getUsers() {
    const response = await fetch('http://localhost:8000/api/v1/identity/users', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load employee directory');
    return response.json();
  },

  async promoteUser(userId, role) {
    const response = await fetch(`http://localhost:8000/api/v1/identity/users/${userId}/promote`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: role }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to promote user');
    }
    return response.json();
  },

  async getDepartments() {
    const response = await fetch('http://localhost:8000/api/v1/identity/departments', { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to load departments');
    return response.json();
  },

  async createDepartment(deptData) {
    const response = await fetch('http://localhost:8000/api/v1/identity/departments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(deptData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to create department');
    }
    return response.json();
  }
};
