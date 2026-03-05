import { API_BASE_URL } from './config';

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const dashboardService = {
  getDashboardStats: async () => {
    return apiCall('/dashboard/stats');
  },

  getRecentShipments: async () => {
    return apiCall('/dashboard/recent-shipments');
  },

  getMonthlyRevenue: async () => {
    return apiCall('/dashboard/monthly-revenue');
  },

  getTopCustomers: async () => {
    return apiCall('/dashboard/top-customers');
  },

  getPaymentStats: async () => {
    return apiCall('/dashboard/payment-stats');
  }
}; 