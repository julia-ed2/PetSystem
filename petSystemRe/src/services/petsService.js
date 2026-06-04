import { apiCall } from './api';

export const petsService = {
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`/pets${query}`, { method: 'GET' });
  },

  summary: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`/pets/summary${query}`, { method: 'GET' });
  },

  getById: async (id) => {
    return apiCall(`/pets/${id}`, { method: 'GET' });
  },

  create: async (data) => {
    return apiCall('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiCall(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiCall(`/pets/${id}`, { method: 'DELETE' });
  },

  getRecords: async (petId) => {
    return apiCall(`/pets/${petId}/records`, { method: 'GET' });
  },

  createRecord: async (petId, data) => {
    return apiCall(`/pets/${petId}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getVaccines: async (petId) => {
    return apiCall(`/pets/${petId}/vaccines`, { method: 'GET' });
  },

  recordVaccine: async (petId, data) => {
    return apiCall(`/pets/${petId}/vaccines`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
