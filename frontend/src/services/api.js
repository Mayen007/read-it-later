import axios from 'axios';

// Use relative URL since we have Vite proxy configured
const raw = import.meta.env.VITE_API_URL || '';
const backend = raw.replace(/\/$/, '');
const API_BASE_URL = backend ? (backend.endsWith('/api') ? backend : `${backend}/api`) : '/api';

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
