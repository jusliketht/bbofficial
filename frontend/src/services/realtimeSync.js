// realtimeSync Service
// Handles real-time data synchronization

import { apiService } from './apiService';

class RealtimeSyncService {
  constructor() {
    this.baseUrl = '/sync';
    this.isConnected = false;
    this.lastSync = null;
  }

  async syncData(data) {
    try {
      const response = await apiService.post(`${this.baseUrl}/data`, data);
      this.lastSync = new Date();
      return response.data;
    } catch (error) {
      console.error('Data sync failed:', error);
      throw error;
    }
  }

  async checkConnection() {
    try {
      const response = await apiService.get(`${this.baseUrl}/status`);
      this.isConnected = response.data.connected;
      return response.data;
    } catch (error) {
      this.isConnected = false;
      console.error('Connection check failed:', error);
      throw error;
    }
  }

  async getLastSyncTime() {
    try {
      const response = await apiService.get(`${this.baseUrl}/last-sync`);
      return response.data;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      throw error;
    }
  }

  async forceSync(data) {
    try {
      const response = await apiService.post(`${this.baseUrl}/force`, data);
      this.lastSync = new Date();
      return response.data;
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }
}

export const realtimeSyncService = new RealtimeSyncService();
export default realtimeSyncService;
