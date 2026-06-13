import N2YOService from '../services/N2YOService.js';
import TLEService from '../services/TLEService.js';
import { AppError } from '../middleware/errorHandler.js';

// N2YO category codes
const SATELLITE_CATEGORIES = {
  iss: { id: 25544, mode: 'single' },
  starlink: { category: 52, mode: 'above' },
  gps: { category: 50, mode: 'above' },
  weather: { category: 3, mode: 'above' },
  communication: { category: 29, mode: 'above' },
  all: { category: 0, mode: 'above' },
};

// In-memory cache for satellite data
const satelliteCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generate cache key from query parameters
 */
const getCacheKey = (lat, lng, category, limit) => {
  return `${lat.toFixed(2)}_${lng.toFixed(2)}_${category}_${limit}`;
};

/**
 * Get cached data if fresh, otherwise return null
 */
const getCachedData = (key) => {
  const cached = satelliteCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL_MS) {
    satelliteCache.delete(key);
    return null;
  }

  return cached.data;
};

/**
 * Store data in cache with timestamp
 */
const setCachedData = (key, data) => {
  satelliteCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

/**
 * Get satellite positions
 */
export const getSatellitePositions = async (req, res, next) => {
  try {
    const { satId, lat, lng, alt = 0, days = 0 } = req.query;

    if (!satId || !lat || !lng) {
      throw new AppError('Missing required parameters: satId, lat, lng', 400);
    }

    const data = await N2YOService.getPositions(
      parseInt(satId),
      parseFloat(lat),
      parseFloat(lng),
      parseInt(alt),
      parseInt(days)
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get satellites above a location
 */
export const getSatellitesAbove = async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, radius = 90, limit = 10 } = req.query;

    if (!lat || !lng) {
      throw new AppError('Missing required parameters: lat, lng', 400);
    }

    // Check cache
    const cacheKey = getCacheKey(parseFloat(lat), parseFloat(lng), 'above', limit);
    let data = getCachedData(cacheKey);

    if (data) {
      return res.json({
        success: true,
        data,
        cached: true,
      });
    }

    data = await N2YOService.getSatellitesAbove(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(alt),
      parseInt(radius),
      parseInt(limit)
    );

    // Cache the result
    setCachedData(cacheKey, data);

    res.json({
      success: true,
      data,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ISS visual passes
 */
export const getISSVisualPasses = async (req, res, next) => {
  try {
    const { lat, lng, alt = 0, days = 10, minVisibility = 300 } = req.query;

    if (!lat || !lng) {
      throw new AppError('Missing required parameters: lat, lng', 400);
    }

    const data = await N2YOService.getISSVisualPasses(
      parseFloat(lat),
      parseFloat(lng),
      parseInt(alt),
      parseInt(days),
      parseInt(minVisibility)
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ISS current position
 */
export const getISSPosition = async (req, res, next) => {
  try {
    const { lat = 0, lng = 0, alt = 0 } = req.query;
    const ISS_ID = 25544;

    // Check cache
    const cacheKey = getCacheKey(parseFloat(lat), parseFloat(lng), 'iss', 1);
    let data = getCachedData(cacheKey);

    if (data) {
      return res.json({
        success: true,
        data,
        cached: true,
      });
    }

    data = await N2YOService.getPositions(
      ISS_ID,
      parseFloat(lat),
      parseFloat(lng),
      parseInt(alt),
      0
    );

    // Cache the result
    setCachedData(cacheKey, data);

    res.json({
      success: true,
      data,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get common satellites (ISS, Starlink, GPS)
 */
export const getCommonSatellites = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      throw new AppError('Missing required parameters: lat, lng', 400);
    }

    // Common satellite IDs
    const satelliteIds = {
      ISS: 25544,
      HUBBLE: 20580,
      STARLINK: 44713, // Example Starlink satellite
    };

    const data = await N2YOService.getSatellitesAbove(
      parseFloat(lat),
      parseFloat(lng),
      0,
      90,
      20
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get satellites by category (ISS, Starlink, GPS, Weather, Communication)
 */
export const getSatellitesByCategory = async (req, res, next) => {
  try {
    const { lat, lng, category = 'all', limit = 25 } = req.query;

    if (!lat || !lng) {
      throw new AppError('Missing required parameters: lat, lng', 400);
    }

    // Check cache first
    const cacheKey = getCacheKey(parseFloat(lat), parseFloat(lng), category, limit);
    let data = getCachedData(cacheKey);

    if (data) {
      return res.json({
        success: true,
        category,
        data,
        cached: true,
      });
    }

    const catConfig = SATELLITE_CATEGORIES[category.toLowerCase()] || SATELLITE_CATEGORIES.all;

    try {
      if (catConfig.mode === 'single') {
        // ISS specific — get its position
        data = await N2YOService.getPositions(
          catConfig.id,
          parseFloat(lat),
          parseFloat(lng),
          0,
          0
        );
      } else {
        // Category-based above query
        // N2YO above endpoint: /above/{lat}/{lng}/{alt}/{radius}/{category}
        data = await N2YOService.getSatellitesByCategory(
          parseFloat(lat),
          parseFloat(lng),
          0,
          90,
          catConfig.category,
          parseInt(limit)
        );
      }
      // Cache the fresh data
      setCachedData(cacheKey, data);
    } catch (err) {
      // If N2YO rate-limits or fails, fall back to TLE-based approximation
      const msg = err.message || (err?.status && String(err.status)) || '';
      if (msg.toLowerCase().includes('exceed') || msg.includes('transactions') || err.statusCode === 429) {
        console.warn('N2YO rate-limited — using TLE fallback');
        data = await TLEService.getSatellitesAbove(parseFloat(lat), parseFloat(lng), 0, 90, catConfig.category, parseInt(limit));
      } else {
        throw err;
      }
    }

    res.json({
      success: true,
      category,
      data,
      cached: false,
    });
  } catch (error) {
    next(error);
  }
};
