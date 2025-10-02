/**
 * Read-it-Later API Client - Simplified
 * Single clean interface for all article operations
 */
import axios from 'axios';

// API configuration
const isDevelopment = import.meta.env.DEV;
const apiBaseURL = isDevelopment
  ? '/api'  // Development: proxy to local backend
  : '/.netlify/functions';  // Production: Netlify Functions

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
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
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
   * Add a new article by URL
   * @param {string} url - Article URL to save
   * @param {Array} tags - Optional tags
   * @returns {Promise<Object>} Created article
   */
  add: (url, tags = []) => {
    return api.post('/articles', { url, tags });
  },

  /**
   * Mark article as read/unread
   * @param {number} id - Article ID
   * @param {boolean} isRead - Read status
   * @returns {Promise<Object>} Updated article
   */
  markAsRead: (id, isRead = true) => {
    return api.put(`/articles?id=${id}`, { is_read: isRead });
  },

  /**
   * Update article (alias for markAsRead for backward compatibility)
   * @param {number} id - Article ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated article
   */
  update: (id, data) => {
    return api.put(`/articles?id=${id}`, data);
  },

  /**
   * Update article tags
   * @param {number} id - Article ID
   * @param {Array} tags - New tags
   * @returns {Promise<Object>} Updated article
   */
  updateTags: (id, tags) => {
    return api.put(`/articles?id=${id}`, { tags });
  },

  /**
   * Delete an article
   * @param {number} id - Article ID
   * @returns {Promise<Object>} Success message
   */
  delete: (id) => {
    return api.delete(`/articles?id=${id}`);
  },

};

export default api;
