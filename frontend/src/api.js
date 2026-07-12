const API_BASE_URL = 'http://localhost:8000/api/v1/operations';

export const api = {
  // --- Bookings ---
  async getBookings(assetId = null) {
    const url = assetId ? `${API_BASE_URL}/bookings?asset_id=${assetId}` : `${API_BASE_URL}/bookings`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  async createBooking(bookingData) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch maintenance requests');
    return response.json();
  },

  async createMaintenanceRequest(requestData) {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'Failed to update maintenance status');
    }
    return response.json();
  }
};
