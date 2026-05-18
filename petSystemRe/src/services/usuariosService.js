import { apiCall } from './api';

export const usuariosService = {
  list: async (includeInativos = false) => {
    const query = includeInativos ? '?include_inativos=true' : '';
    return apiCall(`/usuarios${query}`, { method: 'GET' });
  },

  getById: async (id) => {
    return apiCall(`/usuarios/${id}`, { method: 'GET' });
  },

  create: async (data) => {
    return apiCall('/usuarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiCall(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiCall(`/usuarios/${id}`, { method: 'DELETE' });
  },
};
