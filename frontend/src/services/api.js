/**
 * Read-it-Later API Client - Simplified
 * Single clean interface for all article operations
 */
import axios from 'axios';

// Import.meta.env is Vite-specific environment variable access
// VITE_API_URL is the base URL for the API


// API configuration
const isDevelopment = import.meta.env.DEV;
// Default API base: use VITE_API_URL if provided, otherwise default to local backend.
const apiBaseURL = import.meta.env.VITE_API_URL || (isDevelopment ? 'http://localhost:5000/api' : 'https://readit-backend-r69u.onrender.com/api');

// Create axios instance
const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout (increased for cold starts)
});

// Retry configuration for handling cold starts
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

/**
 * Implements exponential backoff retry logic
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries remaining
 * @returns {Promise} Result of the function
 */
const retryWithBackoff = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
    const status = error.response?.status;
    if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
      throw error;
    }

    if (retries > 0) {
      const delay = RETRY_DELAY * (MAX_RETRIES - retries + 1); // Exponential backoff
      if (import.meta.env.DEV) {
        console.log(`Retrying request in ${delay}ms... (${retries} retries left)`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1);
    }
    throw error;
  }
};

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    // Attach access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh lock to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh tokens on auth endpoints
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    // If 401 error and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        // Get refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the access token
        const response = await axios.post(`${apiBaseURL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccessToken } = response.data;

        // Store new access token
        localStorage.setItem('accessToken', newAccessToken);

        // Notify all queued requests
        isRefreshing = false;
        onRefreshed(newAccessToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }

    if (import.meta.env.DEV) {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Articles API - All operations for managing articles
 */
export const articlesAPI = {

  /**
   * Get all articles
   * @param {Object} filters - Optional filters (unreadOnly, search, page, limit)
   * @returns {Promise<Object>} Object with articles array and pagination metadata
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.unreadOnly) {
      params.append('unread_only', 'true');
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.page) {
      params.append('page', filters.page);
    }

    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const queryString = params.toString();
    const url = `/articles${queryString ? `?${queryString}` : ''}`;
    // Use retry logic for initial load (handles cold starts)
    return retryWithBackoff(() => api.get(url));
  },

  /**
   * Get a single article by ID
   * @param {string} id - The ID of the article to retrieve
   * @returns {Promise<Object>} The article object
   */
  get: (id) => {
    return api.get(`/articles/${id}`);
  },

  /**
   * Add a new article by URL
   * @param {string} url - Article URL to save
   * @param {Array} tags - Optional tags
   * @returns {Promise<Object>} Created article
   */
  add: (url, tags = []) => {
    return api.post('/articles', { url, tags });
  },

  /**
   * Add article with optional categories (array of names or ids)
   */
  addWithCategories: (url, categories = [], tags = []) => {
    return api.post('/articles', { url, categories, tags });
  },

  /**
   * Mark article as read/unread
   * @param {number} id - Article ID
   * @param {boolean} isRead - Read status
   * @returns {Promise<Object>} Updated article
   */
  markAsRead: (id, isRead = true) => {
    return api.put(`/articles/${id}`, { is_read: isRead });
  },

  /**
   * Update article (alias for markAsRead for backward compatibility)
   * @param {number} id - Article ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated article
   */
  update: (id, data) => {
    return api.put(`/articles/${id}`, data);
  },

  /**
   * Update article tags
   * @param {number} id - Article ID
   * @param {Array} tags - New tags
   * @returns {Promise<Object>} Updated article
   */
  updateTags: (id, tags) => {
    return api.put(`/articles/${id}`, { tags });
  },

  // Categories API
  getCategories: () => api.get('/categories'),
  createCategory: (name, color = '') => api.post('/categories', { name, color }),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Bulk assign categories to multiple articles
  bulkAssignCategories: (assignments) => api.put('/articles/bulk-categories', { assignments }),

  /**
   * Delete an article
   * @param {number} id - Article ID
   * @returns {Promise<Object>} Success message
   */
  delete: (id) => {
    return api.delete(`/articles/${id}`);
  },

};

export default api;
