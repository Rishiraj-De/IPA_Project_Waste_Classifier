import axios from 'axios';
import {
  PredictionResponse,
  HistoryListResponse,
  HistoryItem,
  StatisticsResponse,
  CategoryMetadata,
  SystemHealth
} from '../types';

const API_BASE = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const apiService = {
  // Health & Metadata
  async getHealth(): Promise<SystemHealth> {
    const res = await apiClient.get<SystemHealth>('/health');
    return res.data;
  },

  async getCategories(): Promise<{ total_categories: number; categories: CategoryMetadata[] }> {
    const res = await apiClient.get<{ total_categories: number; categories: CategoryMetadata[] }>('/categories');
    return res.data;
  },

  async getDisposalRules(): Promise<{ rules: CategoryMetadata[] }> {
    const res = await apiClient.get<{ rules: CategoryMetadata[] }>('/disposal-rules');
    return res.data;
  },

  // Prediction
  async predictImage(
    file: File,
    enhanceContrast: boolean = false,
    confidenceThreshold?: number
  ): Promise<PredictionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enhance_contrast', String(enhanceContrast));
    if (confidenceThreshold !== undefined) {
      formData.append('confidence_threshold', String(confidenceThreshold));
    }

    const res = await apiClient.post<PredictionResponse>('/predict/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async predictFrame(
    imageBase64: string,
    saveRecord: boolean = false,
    confidenceThreshold?: number
  ): Promise<PredictionResponse> {
    const res = await apiClient.post<PredictionResponse>('/predict/frame', {
      image_base64: imageBase64,
      save_record: saveRecord,
      confidence_threshold: confidenceThreshold,
    });
    return res.data;
  },

  // History
  async getHistory(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    recyclable_only?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<HistoryListResponse> {
    const res = await apiClient.get<HistoryListResponse>('/history', { params });
    return res.data;
  },

  async getHistoryDetail(id: string): Promise<HistoryItem> {
    const res = await apiClient.get<HistoryItem>(`/history/${id}`);
    return res.data;
  },

  async deleteHistoryRecord(id: string): Promise<{ status: string; message: string }> {
    const res = await apiClient.delete<{ status: string; message: string }>(`/history/${id}`);
    return res.data;
  },

  // Dashboard & Statistics
  async getStatistics(): Promise<StatisticsResponse> {
    const res = await apiClient.get<StatisticsResponse>('/statistics');
    return res.data;
  },
};
