import express from 'express';
import {
  getAPOD,
  getNearEarthObjects,
  getHazardousAsteroids,
  getAsteroidById,
} from '../controllers/nasaController.js';

const router = express.Router();

/**
 * @route GET /api/nasa/apod
 * @query date - Date in YYYY-MM-DD format (optional)
 */
router.get('/apod', getAPOD);

/**
 * @route GET /api/nasa/neo
 * @query startDate - Start date in YYYY-MM-DD format
 * @query endDate - End date in YYYY-MM-DD format
 */
router.get('/neo', getNearEarthObjects);

/**
 * @route GET /api/nasa/hazardous-asteroids
 */
router.get('/hazardous-asteroids', getHazardousAsteroids);

/**
 * @route GET /api/nasa/asteroid/:asteroidId
 */
router.get('/asteroid/:asteroidId', getAsteroidById);

export default router;
