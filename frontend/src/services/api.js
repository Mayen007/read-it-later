import axios from 'axios';

// Use different API URLs for development and production
const isDevelopment = import.meta.env.DEV;

let api;

if (isDevelopment) {
  // Development: Use Vite proxy to local Flask server
  api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });
} else {
  // Production: Use Netlify Functions directly
  api = axios.create({
    baseURL: '/.netlify/functions',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const articlesAPI = {
  // Get all articles
  getAll: () => api.get('/articles-simple'),

  // Add a new article
  add: (url) => api.post('/articles-simple', { url }),

  // Update article (mark as read/unread) - need to pass ID in path
  update: (id, data) => api.put(`/articles-simple?id=${id}`, data),

  // Delete article - need to pass ID in path
  delete: (id) => api.delete(`/articles-simple?id=${id}`),
};

export default api;
