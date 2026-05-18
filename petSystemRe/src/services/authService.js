import { apiCall } from './api';

export const authService = {
  register: async (data) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (login, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me', { method: 'GET' });
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch {
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
