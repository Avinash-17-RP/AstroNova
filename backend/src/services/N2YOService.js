import axios from 'axios';
import { config } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const BASE_URL = 'https://api.n2yo.com/rest/v1';

class N2YOService {
  constructor() {
    this.apiKey = config.n2yoApiKey;
    this.baseURL = BASE_URL;
  }

  /**
   * Get satellite positions
   * @param {number} satId - Satellite ID
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} alt - Altitude in km
   * @param {number} seconds - Number of seconds (usually 1 or more, e.g. 1)
   */
  async getPositions(satId, lat, lng, alt = 0, seconds = 1) {
    try {
      // Endpoint format: /positions/{id}/{lat}/{lng}/{alt}/{seconds}&apiKey={apiKey}
      const response = await axios.get(
        `${this.baseURL}/satellite/positions/${satId}/${lat}/${lng}/${alt}/${seconds}/&apiKey=${this.apiKey}`
      );
      if (response.data && response.data.error) {
        throw new AppError(response.data.error, 429);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('N2YO getPositions error:', error.message);
      throw new Error(`Failed to fetch satellite positions: ${error.message}`);
    }
  }

  /**
   * Get satellites above a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} alt - Altitude in km
   * @param {number} radius - Search radius in km
   * @param {number} limit - Max results
   */
  async getSatellitesAbove(lat, lng, alt = 0, radius = 90, limit = 10) {
    try {
      // Use category 0 (ALL) for generic above: /above/{lat}/{lng}/{alt}/{radius}/{category}&apiKey={apiKey}
      const response = await axios.get(
        `${this.baseURL}/satellite/above/${lat}/${lng}/${alt}/${radius}/0/&apiKey=${this.apiKey}`
      );
      const result = response.data;
      if (result && result.error) {
        throw new AppError(result.error, 429);
      }
      if (result.above && Array.isArray(result.above)) {
        result.above = result.above.slice(0, limit);
      }
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('N2YO getSatellitesAbove error:', error.message);
      throw new Error(`Failed to fetch satellites above location: ${error.message}`);
    }
  }

  /**
   * Get ISS visual passes
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} alt - Altitude in km
   * @param {number} days - Number of days to check
   * @param {number} minVisibility - Minimum visibility in seconds
   */
  async getISSVisualPasses(lat, lng, alt = 0, days = 10, minVisibility = 300) {
    try {
      // ISS satellite ID is 25544
      // Endpoint: /visualpasses/{id}/{lat}/{lng}/{alt}/{days}/{min_visibility}&apiKey={apiKey}
      const response = await axios.get(
        `${this.baseURL}/satellite/visualpasses/25544/${lat}/${lng}/${alt}/${days}/${minVisibility}/&apiKey=${this.apiKey}`
      );
      if (response.data && response.data.error) {
        throw new AppError(response.data.error, 429);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('N2YO getISSVisualPasses error:', error.message);
      throw new Error(`Failed to fetch ISS visual passes: ${error.message}`);
    }
  }

  /**
   * Get TLE (Two-Line Element) data for a satellite
   * @param {number} satId - Satellite ID
   */
  async getTLE(satId) {
    try {
      // Endpoint: /tle/{id}&apiKey={apiKey}
      const response = await axios.get(
        `${this.baseURL}/satellite/tle/${satId}/&apiKey=${this.apiKey}`
      );
      if (response.data && response.data.error) {
        throw new AppError(response.data.error, 429);
      }
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('N2YO getTLE error:', error.message);
      throw new Error(`Failed to fetch TLE data: ${error.message}`);
    }
  }

  /**
   * Get all tracked satellites
   */
  async getTrackedSatellites() {
    try {
      // N2YO doesn't have a simple list endpoint, let's query all above current coords
      return { satellites: [] };
    } catch (error) {
      console.error('N2YO getTrackedSatellites error:', error.message);
      throw new Error(`Failed to fetch tracked satellites: ${error.message}`);
    }
  }

  /**
   * Get satellites by category above a location
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} alt - Altitude in km
   * @param {number} radius - Search radius in degrees
   * @param {number} category - N2YO category code (0=all, 3=weather, 29=comm, 50=gps, 52=starlink)
   * @param {number} limit - Max results
   */
  async getSatellitesByCategory(lat, lng, alt = 0, radius = 90, category = 0, limit = 25) {
    try {
      // Endpoint: /above/{lat}/{lng}/{alt}/{radius}/{category}&apiKey={apiKey}
      const response = await axios.get(
        `${this.baseURL}/satellite/above/${lat}/${lng}/${alt}/${radius}/${category}/&apiKey=${this.apiKey}`
      );
      // Limit client-side since N2YO doesn't support it
      const result = response.data;
      if (result && result.error) {
        throw new AppError(result.error, 429);
      }
      if (result.above && Array.isArray(result.above)) {
        result.above = result.above.slice(0, limit);
      }
      return result;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('N2YO getSatellitesByCategory error:', error.message);
      throw new Error(`Failed to fetch satellites by category: ${error.message}`);
    }
  }
}

export default new N2YOService();
