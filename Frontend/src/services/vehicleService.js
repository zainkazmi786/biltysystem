import axios from 'axios';

import { API_BASE_URL } from './config';
const API_URL = `${API_BASE_URL}/vehicles`;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getAllVehicles = async () => {
  const token = getAuthToken();
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const getVehicleById = async (id) => {
  const token = getAuthToken();
  const response = await axios.get(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const createVehicle = async (vehicle) => {
  const token = getAuthToken();
  const response = await axios.post(API_URL, vehicle, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const updateVehicle = async (id, vehicle) => {
  const token = getAuthToken();
  const response = await axios.put(`${API_URL}/${id}`, vehicle, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data.data;
};

export const deleteVehicle = async (id) => {
  const token = getAuthToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};