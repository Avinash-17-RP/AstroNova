import api from './api';

class AstronomyService {
  /**
   * Get moon data
   */
  async getMoonData(lat, lng, date) {
    const response = await api.get('/astronomy/moon', {
      params: { lat, lng, date },
    });
    return response.data;
  }

  /**
   * Get planet data
   */
  async getPlanetData(lat, lng, date, planet) {
    const response = await api.get('/astronomy/planet', {
      params: { lat, lng, date, planet },
    });
    return response.data;
  }

  /**
   * Get all celestial bodies
   */
  async getAllBodies(lat, lng, date) {
    const response = await api.get('/astronomy/bodies', {
      params: { lat, lng, date },
    });
    return response.data;
  }

  /**
   * Get constellation data
   */
  async getConstellation(constellationId) {
    const response = await api.get('/astronomy/constellation', {
      params: { constellationId },
    });
    return response.data;
  }
}

export default new AstronomyService();
