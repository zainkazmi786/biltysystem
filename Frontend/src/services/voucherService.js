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

// Voucher API functions
export const voucherService = {
  // Create new voucher
  createVoucher: async (voucherData) => {
    return apiCall('/vouchers/create', {
      method: 'POST',
      body: JSON.stringify(voucherData),
    });
  },  

  // Get all vouchers with optional filters
  getVouchers: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
    
    const queryString = queryParams.toString();
    const endpoint = `/vouchers/get/all${queryString ? `?${queryString}` : ''}`;
    
    return apiCall(endpoint);
  },

  // Get single voucher by ID
  getVoucherById: async (id) => {
    return apiCall(`/vouchers/get/${id}`);
  },

  // Update voucher
  updateVoucher: async (id, updateData) => {
    return apiCall(`/vouchers/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete voucher
  deleteVoucher: async (id) => {
    return apiCall(`/vouchers/delete/${id}`, {
      method: 'DELETE',
    });
  },

  // Get vouchers available for trip (trip_made=false)
  getAvailableVouchersForTrip: async () => {
    const response = await apiCall('/vouchers/available-for-trip');
    return response.data;
  },
};