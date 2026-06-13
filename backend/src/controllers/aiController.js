import GeminiService from '../services/GeminiService.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Ask AI about space/astronomy
 */
export const askAboutSpace = async (req, res, next) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      throw new AppError('Missing required field: question', 400);
    }

    const response = await GeminiService.askAboutSpace(question, context || {});

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get what's visible tonight
 */
export const getWhatsVisibleTonight = async (req, res, next) => {
  try {
    const { astronomyData, satelliteData } = req.body;

    const response = await GeminiService.getWhatsVisibleTonight(
      astronomyData || {},
      satelliteData || {}
    );

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get satellite explanation
 */
export const explainSatellite = async (req, res, next) => {
  try {
    const { satelliteName, satelliteData } = req.body;

    if (!satelliteName) {
      throw new AppError('Missing required field: satelliteName', 400);
    }

    const response = await GeminiService.explainSatellite(satelliteName, satelliteData || {});

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * General chat endpoint
 */
export const chat = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      throw new AppError('Missing required field: message', 400);
    }

    const response = await GeminiService.generateResponse(message, context || {});

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};
