import { apiCall } from './api';

export const veterinariosService = {
  list: async () => {
    return apiCall('/veterinarios', { method: 'GET' });
  },

  getById: async (id) => {
    return apiCall(`/veterinarios/${id}`, { method: 'GET' });
  },
};
