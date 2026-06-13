import api from './api';

const SATELLITE_IDS = {
  ISS: 25544,
};

class SatelliteService {
  /** Get satellite positions (single sat) */
  async getPositions(satId, lat, lng, alt = 0, days = 0) {
    const response = await api.get('/satellites/positions', {
      params: { satId, lat, lng, alt, days },
    });
    return response.data;
  }

  /** Get satellites above a location (generic) */
  async getSatellitesAbove(lat, lng, alt = 0, radius = 90, limit = 25) {
    const response = await api.get('/satellites/above', {
      params: { lat, lng, alt, radius, limit },
    });
    return response.data;
  }

  /** Get satellites by category: iss|starlink|gps|weather|communication|all */
  async getSatellitesByCategory(category = 'all', lat, lng, limit = 25) {
    const response = await api.get('/satellites/category', {
      params: { category, lat, lng, limit },
    });
    return response.data;
  }

  /** Get ISS visual passes */
  async getISSVisualPasses(lat, lng, alt = 0, days = 10, minVisibility = 300) {
    const response = await api.get('/satellites/iss-passes', {
      params: { lat, lng, alt, days, minVisibility },
    });
    return response.data;
  }

  /** Get ISS current position */
  async getISSPosition(lat = 0, lng = 0, alt = 0) {
    const response = await api.get('/satellites/iss-position', {
      params: { lat, lng, alt },
    });
    return response.data;
  }

  /** Get common satellites (above, all cats) */
  async getCommonSatellites(lat, lng) {
    const response = await api.get('/satellites/common', {
      params: { lat, lng },
    });
    return response.data;
  }
}

export default new SatelliteService();
