import express from 'express';
import {
  askAboutSpace,
  getWhatsVisibleTonight,
  explainSatellite,
  chat,
} from '../controllers/aiController.js';

const router = express.Router();

/**
 * @route POST /api/ai/ask
 * @body question - Question about space/astronomy
 * @body context - Optional context data
 */
router.post('/ask', askAboutSpace);

/**
 * @route POST /api/ai/visible-tonight
 * @body astronomyData - Current astronomy data
 * @body satelliteData - Current satellite data
 */
router.post('/visible-tonight', getWhatsVisibleTonight);

/**
 * @route POST /api/ai/explain-satellite
 * @body satelliteName - Name of satellite
 * @body satelliteData - Satellite data
 */
router.post('/explain-satellite', explainSatellite);

/**
 * @route POST /api/ai/chat
 * @body message - Chat message
 * @body context - Optional context
 */
router.post('/chat', chat);

export default router;
