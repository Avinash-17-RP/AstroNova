import express from 'express';
import {
  getSatellitePositions,
  getSatellitesAbove,
  getISSVisualPasses,
  getISSPosition,
  getCommonSatellites,
  getSatellitesByCategory,
} from '../controllers/satelliteController.js';

const router = express.Router();


/**
 * @route GET /api/satellites/positions
 * @query satId - Satellite ID
 * @query lat - Latitude
 * @query lng - Longitude
 * @query alt - Altitude (default: 0)
 * @query days - Number of days (default: 0)
 */
router.get('/positions', getSatellitePositions);

/**
 * @route GET /api/satellites/above
 * @query lat - Latitude
 * @query lng - Longitude
 * @query alt - Altitude (default: 0)
 * @query radius - Search radius in km (default: 90)
 * @query limit - Max results (default: 10)
 */
router.get('/above', getSatellitesAbove);

/**
 * @route GET /api/satellites/iss-passes
 * @query lat - Latitude
 * @query lng - Longitude
 * @query alt - Altitude (default: 0)
 * @query days - Number of days to check (default: 10)
 * @query minVisibility - Minimum visibility in seconds (default: 300)
 */
router.get('/iss-passes', getISSVisualPasses);

/**
 * @route GET /api/satellites/iss-position
 * @query lat - Latitude (default: 0)
 * @query lng - Longitude (default: 0)
 * @query alt - Altitude (default: 0)
 */
router.get('/iss-position', getISSPosition);

/**
 * @route GET /api/satellites/common
 * @query lat - Latitude
 * @query lng - Longitude
 */
router.get('/common', getCommonSatellites);

/**
 * @route GET /api/satellites/category
 * @query lat - Latitude
 * @query lng - Longitude
 * @query category - Category name (iss|starlink|gps|weather|communication|all)
 * @query limit - Max results (default: 25)
 */
router.get('/category', getSatellitesByCategory);

export default router;
