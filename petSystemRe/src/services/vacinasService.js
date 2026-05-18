import { apiCall } from './api';

export const vacinasService = {
  listByPet: async (petId) => {
    return apiCall(`/pets/${petId}/vaccines`, { method: 'GET' });
  },

  recordVaccine: async (petId, data) => {
    return apiCall(`/pets/${petId}/vaccines`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  recordVaccinesMultiple: async (petIds, vaccineInfo) => {
    const promises = petIds.map((petId) =>
      vacinasService.recordVaccine(petId, vaccineInfo).catch((err) => ({
        petId,
        error: err.message,
      }))
    );
    return Promise.all(promises);
  },
};
