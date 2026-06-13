import axios from 'axios';
import { config } from '../config/env.js';

class NASAService {
  constructor() {
    this.apiKey = config.nasaApiKey;
  }

  /**
   * Get Astronomy Picture of the Day
   * @param {string} date - Date in YYYY-MM-DD format (optional)
   */
  async getAPOD(date = null) {
    try {
      const params = {
        api_key: this.apiKey,
      };
      if (date) {
        params.date = date;
      }

      const response = await axios.get('https://api.nasa.gov/planetary/apod', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('NASA getAPOD error:', error.message);
      throw new Error(`Failed to fetch APOD: ${error.message}`);
    }
  }

  /**
   * Get near-Earth objects
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   */
  async getNearEarthObjects(startDate, endDate) {
    try {
      const response = await axios.get('https://api.nasa.gov/neo/rest/v1/feed', {
        params: {
          start_date: startDate,
          end_date: endDate,
          api_key: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('NASA getNearEarthObjects error:', error.message);
      throw new Error(`Failed to fetch near-Earth objects: ${error.message}`);
    }
  }

  /**
   * Get hazardous asteroid data
   */
  async getHazardousAsteroids() {
    try {
      const response = await axios.get('https://api.nasa.gov/neo/rest/v1/neo/browse', {
        params: {
          is_potentially_hazardous_asteroid: true,
          api_key: this.apiKey,
          size: 5,
        },
      });
      return response.data;
    } catch (error) {
      console.error('NASA getHazardousAsteroids error:', error.message);
      throw new Error(`Failed to fetch hazardous asteroids: ${error.message}`);
    }
  }

  /**
   * Get specific asteroid data by ID
   * @param {string} asteroidId - Asteroid ID
   */
  async getAsteroidById(asteroidId) {
    try {
      const response = await axios.get(`https://api.nasa.gov/neo/rest/v1/neo/${asteroidId}`, {
        params: {
          api_key: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('NASA getAsteroidById error:', error.message);
      throw new Error(`Failed to fetch asteroid data: ${error.message}`);
    }
  }
}

export default new NASAService();
