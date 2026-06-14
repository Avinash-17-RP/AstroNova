import express from 'express';
import { config } from '../config/env.js';

const router = express.Router();

/**
 * @route GET /api/config/public
 * @description Get public configuration that's safe for frontend
 * @returns {object} Public config
 */
router.get('/public', (req, res) => {
  res.json({
    success: true,
    data: {
      apiUrl: config.frontendUrl,
      environment: config.nodeEnv,
      // Add any other public config here
      // DO NOT expose API keys here!
    },
  });
});

export default router;
