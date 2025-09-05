import axios from 'axios';

// Use different API URLs for development and production
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment
  ? '/api'  // Uses Vite proxy in development
  : '/.netlify/functions/api';  // Uses Netlify Functions in production

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const articlesAPI = {
  // Get all articles
  getAll: () => api.get('/articles'),

  // Add a new article
  add: (url) => api.post('/articles', { url }),

  // Update article (mark as read/unread)
  update: (id, data) => api.put(`/articles/${id}`, data),

  // Delete article
  delete: (id) => api.delete(`/articles/${id}`),
};

export default api;
