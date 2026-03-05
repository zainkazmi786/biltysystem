import axios from 'axios';

import { API_BASE_URL } from './config';
const API_URL = `${API_BASE_URL}/claims`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Claim {
  _id: string;
  biltyNumber: string;
  claimDate: string;
  solvingDate?: string;
  solvingDuration?: number;
  amount: number;
  numberOfInstallments: number;
  relatedDocument?: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimsStats {
  totalClaims: number;
  pendingClaims: number;
  resolvedClaims: number;
  totalAmount: number;
}

export const getClaims = async (search?: string, status?: string): Promise<Claim[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  
  const response = await api.get(`/?${params.toString()}`);
  return response.data;
};

export const getClaimById = async (id: string): Promise<Claim> => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const createClaim = async (formData: FormData): Promise<Claim> => {
  const response = await api.post('/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateClaim = async (id: string, formData: FormData): Promise<Claim> => {
  const response = await api.put(`/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteClaim = async (id: string): Promise<void> => {
  await api.delete(`/${id}`);
};

export const downloadDocument = async (id: string): Promise<Blob> => {
  const response = await api.get(`/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const getClaimsStats = async (): Promise<ClaimsStats> => {
  const response = await api.get('/stats');
  return response.data;
};