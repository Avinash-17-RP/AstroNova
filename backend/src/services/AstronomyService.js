import axios from 'axios';
import { config } from '../config/env.js';

class AstronomyService {
  constructor() {
    this.appId = config.astronomyAppId;
    this.appSecret = config.astronomyAppSecret;
    this.baseURL = 'https://api.astronomyapi.com/api/v2';
  }

  /**
   * Get moon data for a given location and time
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async getMoonData(lat, lng, date) {
    try {
      // Get current time or fallback to 12:00:00
      const time = new Date().toTimeString().split(' ')[0] || '12:00:00';
      const response = await axios.get(`${this.baseURL}/bodies/positions`, {
        params: {
          latitude: lat,
          longitude: lng,
          elevation: 0,
          from_date: date,
          to_date: date,
          time: time,
          objects: 'moon',
        },
        auth: {
          username: this.appId,
          password: this.appSecret,
        },
      });
      
      const rows = response.data?.data?.table?.rows;
      const moonRow = rows?.find(r => r.entry?.id === 'moon');
      
      // Also request the moon phase SVG studio generation
      let imageUrl = '';
      try {
        const studioResponse = await axios.post(`${this.baseURL}/studio/moon-phase`, {
          format: 'svg',
          style: {
            moonStyle: 'sketch',
            backgroundColor: 'black',
            headingColor: 'white',
            textColor: 'white'
          },
          observer: {
            latitude: lat,
            longitude: lng,
            date: date
          },
          view: {
            type: 'portrait-simple',
            orientation: 'north-up'
          }
        }, {
          auth: {
            username: this.appId,
            password: this.appSecret,
          }
        });
        imageUrl = studioResponse.data?.data?.imageUrl;
      } catch (err) {
        console.warn('Moon studio generation failed, continuing without custom image:', err.message);
      }

      return {
        ...moonRow?.cells?.[0],
        imageUrl
      };
    } catch (error) {
      console.error('Astronomy getMoonData error:', error.message);
      throw new Error(`Failed to fetch moon data: ${error.message}`);
    }
  }

  /**
   * Get planet data for a given location and time
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} planet - Planet name (mercury, venus, mars, jupiter, saturn)
   */
  async getPlanetData(lat, lng, date, planet) {
    try {
      const time = new Date().toTimeString().split(' ')[0] || '12:00:00';
      const response = await axios.get(`${this.baseURL}/bodies/positions`, {
        params: {
          latitude: lat,
          longitude: lng,
          elevation: 0,
          from_date: date,
          to_date: date,
          time: time,
          objects: planet,
        },
        auth: {
          username: this.appId,
          password: this.appSecret,
        },
      });
      const rows = response.data?.data?.table?.rows;
      const planetRow = rows?.find(r => r.entry?.id === planet);
      return planetRow?.cells?.[0] || {};
    } catch (error) {
      console.error(`Astronomy getPlanetData error for ${planet}:`, error.message);
      throw new Error(`Failed to fetch ${planet} data: ${error.message}`);
    }
  }

  /**
   * Get all visible celestial bodies
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async getAllBodies(lat, lng, date) {
    try {
      const time = new Date().toTimeString().split(' ')[0] || '12:00:00';
      const response = await axios.get(`${this.baseURL}/bodies/positions`, {
        params: {
          latitude: lat,
          longitude: lng,
          elevation: 0,
          from_date: date,
          to_date: date,
          time: time,
          objects: 'moon,mercury,venus,mars,jupiter,saturn',
        },
        auth: {
          username: this.appId,
          password: this.appSecret,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Astronomy getAllBodies error:', error.message);
      throw new Error(`Failed to fetch celestial bodies data: ${error.message}`);
    }
  }

  /**
   * Get constellation data
   * @param {string} constellationId - Constellation identifier
   */
  async getConstellation(constellationId) {
    try {
      const response = await axios.get(`${this.baseURL}/constellations/${constellationId}`, {
        auth: {
          username: this.appId,
          password: this.appSecret,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Astronomy getConstellation error:', error.message);
      throw new Error(`Failed to fetch constellation data: ${error.message}`);
    }
  }
}

export default new AstronomyService();
