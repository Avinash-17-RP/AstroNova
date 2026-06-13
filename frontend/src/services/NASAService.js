import api from './api';

class NASAService {
  /**
   * Get Astronomy Picture of the Day
   */
  async getAPOD(date = null) {
    const response = await api.get('/nasa/apod', {
      params: date ? { date } : {},
    });
    return response.data;
  }

  /**
   * Get near-Earth objects
   */
  async getNearEarthObjects(startDate, endDate) {
    const response = await api.get('/nasa/neo', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Get hazardous asteroids
   */
  async getHazardousAsteroids() {
    const response = await api.get('/nasa/hazardous-asteroids');
    return response.data;
  }

  /**
   * Get asteroid by ID
   */
  async getAsteroidById(asteroidId) {
    const response = await api.get(`/nasa/asteroid/${asteroidId}`);
    return response.data;
  }
}

export default new NASAService();
