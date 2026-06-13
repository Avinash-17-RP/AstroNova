import AstronomyService from '../services/AstronomyService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Get moon data
 */
export const getMoonData = async (req, res, next) => {
  try {
    const { lat, lng, date } = req.query;

    if (!lat || !lng || !date) {
      throw new AppError('Missing required parameters: lat, lng, date', 400);
    }

    const data = await AstronomyService.getMoonData(
      parseFloat(lat),
      parseFloat(lng),
      date
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
 * Get planet data
 */
export const getPlanetData = async (req, res, next) => {
  try {
    const { lat, lng, date, planet } = req.query;

    if (!lat || !lng || !date || !planet) {
      throw new AppError('Missing required parameters: lat, lng, date, planet', 400);
    }

    const validPlanets = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
    if (!validPlanets.includes(planet.toLowerCase())) {
      throw new AppError(`Invalid planet. Valid planets: ${validPlanets.join(', ')}`, 400);
    }

    const data = await AstronomyService.getPlanetData(
      parseFloat(lat),
      parseFloat(lng),
      date,
      planet.toLowerCase()
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
 * Get all celestial bodies
 */
export const getAllBodies = async (req, res, next) => {
  try {
    const { lat, lng, date } = req.query;

    if (!lat || !lng || !date) {
      throw new AppError('Missing required parameters: lat, lng, date', 400);
    }

    const data = await AstronomyService.getAllBodies(
      parseFloat(lat),
      parseFloat(lng),
      date
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
 * Get constellation data
 */
export const getConstellation = async (req, res, next) => {
  try {
    const { constellationId } = req.query;

    if (!constellationId) {
      throw new AppError('Missing required parameter: constellationId', 400);
    }

    const data = await AstronomyService.getConstellation(constellationId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
