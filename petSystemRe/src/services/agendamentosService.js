import { apiCall } from './api';

export const agendamentosService = {
  list: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiCall(`/agendamentos${query}`, { method: 'GET' });
  },

  getById: async (id) => {
    return apiCall(`/agendamentos/${id}`, { method: 'GET' });
  },

  create: async (data) => {
    return apiCall('/agendamentos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiCall(`/agendamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiCall(`/agendamentos/${id}`, { method: 'DELETE' });
  },
};
