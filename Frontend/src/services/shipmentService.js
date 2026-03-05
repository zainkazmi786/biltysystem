import { API_BASE_URL } from './config';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Shipment API functions
export const shipmentService = {
  // Create new shipment
  createShipment: async (shipmentData) => {
    return apiCall('/shipments/create', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  },

  // Get all shipments with optional filters
  getShipments: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.paymentStatus) queryParams.append('paymentStatus', filters.paymentStatus);
    
    const queryString = queryParams.toString();
    const endpoint = `/shipments/get/all${queryString ? `?${queryString}` : ''}`;
    
    return apiCall(endpoint);
  },

  // Get single shipment by ID
  getShipmentById: async (id) => {
    return apiCall(`/shipments/get/${id}`);
  },

  // Update shipment
  updateShipment: async (id, updateData) => {
    return apiCall(`/shipments/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete shipment
  deleteShipment: async (id) => {
    return apiCall(`/shipments/delete/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth API functions
export const authService = {
  // Login
  login: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register
  register: async (userData) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },
}; 