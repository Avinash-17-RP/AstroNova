import express from 'express';
import {
  getMoonData,
  getPlanetData,
  getAllBodies,
  getConstellation,
} from '../controllers/astronomyController.js';

const router = express.Router();

/**
 * @route GET /api/astronomy/moon
 * @query lat - Latitude
 * @query lng - Longitude
 * @query date - Date in YYYY-MM-DD format
 */
router.get('/moon', getMoonData);

/**
 * @route GET /api/astronomy/planet
 * @query lat - Latitude
 * @query lng - Longitude
 * @query date - Date in YYYY-MM-DD format
 * @query planet - Planet name (mercury, venus, mars, jupiter, saturn)
 */
router.get('/planet', getPlanetData);

/**
 * @route GET /api/astronomy/bodies
 * @query lat - Latitude
 * @query lng - Longitude
 * @query date - Date in YYYY-MM-DD format
 */
router.get('/bodies', getAllBodies);

/**
 * @route GET /api/astronomy/constellation
 * @query constellationId - Constellation identifier
 */
router.get('/constellation', getConstellation);

export default router;
