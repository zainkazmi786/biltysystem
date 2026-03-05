import axios from 'axios';

const API_URL = 'http://localhost:8000/api/customers';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get all customers with optional filtering
export const getCustomers = async (params = {}) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/get/all`, { 
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get customer by ID
export const getCustomerById = async (id) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/get/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new customer
export const createCustomer = async (customerData) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/create`, customerData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update customer
export const updateCustomer = async (id, customerData) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/update/${id}`, customerData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete customer
export const deleteCustomer = async (id) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add bilty to customer
export const addBiltyToCustomer = async (customerId, biltyData) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_URL}/${customerId}/bilties`, biltyData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update bilty payment status
export const updateBiltyPaymentStatus = async (customerId, biltyNumber, paymentStatus) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(
      `${API_URL}/${customerId}/bilties/${biltyNumber}/payment-status`,
      { payment_status: paymentStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Remove bilty from customer
export const removeBiltyFromCustomer = async (customerId, biltyNumber) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/${customerId}/bilties/${biltyNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get customer statistics
export const getCustomerStats = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Search customer by bilty number
export const searchCustomerByBilty = async (biltyNumber) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/search/bilty/${biltyNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};