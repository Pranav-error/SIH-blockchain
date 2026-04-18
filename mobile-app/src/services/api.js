import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/authStore';

// API base URL - configure in app.json
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    } else if (!error.response) {
      error.message = 'Network Error';
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Login
  login: async (collectorId, pin) => {
    const response = await apiClient.post('/collector/login', {
      collector_id: collectorId,
      pin: pin,
    });
    return response.data;
  },

  // Submit collection to blockchain
  submitCollection: async (collection) => {
    const response = await apiClient.post('/blockchain/collection', {
      product_id: collection.product_id,
      species: collection.species,
      gps: {
        lat: collection.gps.lat,
        lon: collection.gps.lon,
      },
      collector_id: collection.collector_id,
      quantity: collection.quantity,
      timestamp: collection.timestamp,
      notes: collection.notes,
    });
    return response.data;
  },

  // Get product trace
  getProductTrace: async (productId) => {
    const response = await apiClient.get(`/blockchain/trace/${productId}`);
    return response.data;
  },

  // Get collector profile
  getProfile: async (collectorId) => {
    const response = await apiClient.get(`/collector/${collectorId}`);
    return response.data;
  },

  // Get approved zones for a species
  getApprovedZones: async (species) => {
    const response = await apiClient.get(`/zones/${species}`);
    return response.data;
  },

  // Get recent hardware intake events (ESP32 submissions)
  getIntakeEvents: async (limit = 50) => {
    const response = await apiClient.get(`/intake/events?limit=${limit}`);
    return response.data.events || [];
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health', { timeout: 5000 });
      return response.data;
    } catch (error) {
      return { status: 'offline' };
    }
  },

  // Batch sync
  batchSync: async (collections) => {
    const response = await apiClient.post('/blockchain/batch-collection', {
      collections: collections,
    });
    return response.data;
  },
};

// Export axios instance for custom calls
export { apiClient };
