import NASAService from '../services/NASAService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Get Astronomy Picture of the Day
 */
export const getAPOD = async (req, res, next) => {
  try {
    const { date } = req.query;

    const data = await NASAService.getAPOD(date || null);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get near-Earth objects
 */
export const getNearEarthObjects = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new AppError('Missing required parameters: startDate, endDate', 400);
    }

    const data = await NASAService.getNearEarthObjects(startDate, endDate);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get hazardous asteroids
 */
export const getHazardousAsteroids = async (req, res, next) => {
  try {
    const data = await NASAService.getHazardousAsteroids();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get asteroid by ID
 */
export const getAsteroidById = async (req, res, next) => {
  try {
    const { asteroidId } = req.params;

    if (!asteroidId) {
      throw new AppError('Missing required parameter: asteroidId', 400);
    }

    const data = await NASAService.getAsteroidById(asteroidId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
