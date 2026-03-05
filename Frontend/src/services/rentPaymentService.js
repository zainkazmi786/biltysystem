import axios from 'axios';

import { API_BASE_URL } from './config';
const API_URL = `${API_BASE_URL}/rent-payments`;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get all rent payments
export const getAllRentPayments = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching rent payments:', error);
    throw error;
  }
};

// Get rent payments by shop ID
export const getRentPaymentsByShop = async (shopId) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/shop/${shopId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching rent payments by shop:', error);
    throw error;
  }
};

// Create a new rent payment
export const createRentPayment = async (rentPaymentData) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(API_URL, rentPaymentData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating rent payment:', error);
    throw error;
  }
};

// Get rent payment by ID
export const getRentPaymentById = async (id) => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching rent payment:', error);
    throw error;
  }
};

// Update rent payment
export const updateRentPayment = async (id, rentPaymentData) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${id}`, rentPaymentData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating rent payment:', error);
    throw error;
  }
};

// Delete rent payment
export const deleteRentPayment = async (id) => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting rent payment:', error);
    throw error;
  }
};