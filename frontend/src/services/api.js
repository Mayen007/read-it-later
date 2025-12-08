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
  timeout: 30000, // 30 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
   * @param {Object} filters - Optional filters (unread_only, search)
   * @returns {Promise<Array>} Array of articles
   */
  getAll: (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.unreadOnly) {
      params.append('unread_only', 'true');
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    const url = `/articles${queryString ? `?${queryString}` : ''}`;
    return api.get(url);
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
