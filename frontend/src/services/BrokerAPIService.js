// =====================================================
// BROKER API SERVICE
// Future API integration for brokers (Zerodha, Angel One, Upstox)
// =====================================================

import apiClient from './apiClient';
import { enterpriseLogger } from '../utils/logger';

export class BrokerAPIService {
  constructor(brokerId) {
    this.brokerId = brokerId;
    this.apiEndpoints = {
      zerodha: '/api/broker/zerodha/capital-gains',
      angelone: '/api/broker/angelone/capital-gains',
      upstox: '/api/broker/upstox/capital-gains',
      groww: null, // Not available yet
      icici: null // Not available yet
    };
  }

  async fetchCapitalGains() {
    try {
      const endpoint = this.apiEndpoints[this.brokerId];
      
      if (!endpoint) {
        throw new Error(`API not available for ${this.brokerId}`);
      }

      const response = await apiClient.get(endpoint);
      
      enterpriseLogger.info('Capital gains fetched from broker API', {
        broker: this.brokerId,
        transactions: response.data.transactions?.length || 0
      });

      return this.normalizeAPIResponse(response.data);
    } catch (error) {
      enterpriseLogger.error('Failed to fetch capital gains from broker API', {
        broker: this.brokerId,
        error: error.message
      });
      throw error;
    }
  }

  async authenticate(credentials) {
    try {
      const response = await apiClient.post(`/api/broker/${this.brokerId}/auth`, credentials);
      
      enterpriseLogger.info('Broker API authenticated', {
        broker: this.brokerId
      });

      return response.data;
    } catch (error) {
      enterpriseLogger.error('Broker API authentication failed', {
        broker: this.brokerId,
        error: error.message
      });
      throw error;
    }
  }

  normalizeAPIResponse(data) {
    return {
      transactions: data.transactions || [],
      shortTerm: data.shortTermGains || 0,
      longTerm: data.longTermGains || 0,
      exemptLongTerm: data.exemptLongTermGains || 0
    };
  }

  async getAvailableBrokers() {
    try {
      const response = await apiClient.get('/api/broker/available');
      return response.data.brokers || [];
    } catch (error) {
      enterpriseLogger.error('Failed to fetch available brokers', {
        error: error.message
      });
      return [];
    }
  }
}

export default BrokerAPIService;

