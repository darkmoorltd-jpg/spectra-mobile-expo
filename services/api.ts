import axios from 'axios';
import { supabase } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export interface Prediction {
  mineral: string;
  display_name: string;
  confidence: number;
  is_unknown: boolean;
  top_3: Array<{ mineral: string; confidence: number }>;
  georoc?: {
    found_samples: number;
    region_match: boolean | null;
    message: string;
  };
}

export interface ScanRecord {
  id: number;
  mineral: string;
  confidence: number;
  image_url?: string;
  created_at: string;
}

export const predictMineral = async (
  imageUri: string,
  lat?: number,
  lon?: number,
  threshold: number = 0.6
): Promise<Prediction> => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('file', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  if (lat !== undefined) formData.append('latitude', String(lat));
  if (lon !== undefined) formData.append('longitude', String(lon));
  formData.append('confidence_threshold', String(threshold));

  const response = await api.post('/scan/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getHistory = async (): Promise<ScanRecord[]> => {
  const response = await api.get('/scan/history');
  return response.data;
};

export const getRemainingScans = async () => {
  const response = await api.get('/user/scans');
  return response.data;
};

export const verifyPayment = async (reference: string) => {
  const response = await api.post('/payment/verify', { reference });
  return response.data;
};

export default api;
