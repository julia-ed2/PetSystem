import { apiCall } from './api';

export const tutoresService = {
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`/tutores${query}`, { method: 'GET' });
  },

  getById: async (id) => {
    return apiCall(`/tutores/${id}`, { method: 'GET' });
  },

  create: async (data) => {
    return apiCall('/tutores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiCall(`/tutores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiCall(`/tutores/${id}`, { method: 'DELETE' });
  },
};
