import axios from 'axios';

import { API_BASE_URL } from './config';
const API_URL = `${API_BASE_URL}/drivers`;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getAllDrivers = async () => {
  const token = getAuthToken();
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const getDriverById = async (id) => {
  const token = getAuthToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const createDriver = async (driver) => {
  const token = getAuthToken();
  const response = await axios.post(API_URL, driver, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const updateDriver = async (id, driver) => {
  const token = getAuthToken();
  const response = await axios.put(`${API_URL}/${id}`, driver, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const deleteDriver = async (id) => {
  const token = getAuthToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};