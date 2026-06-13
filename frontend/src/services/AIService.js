import api from './api';

class AIService {
  /**
   * Ask about space/astronomy
   */
  async askAboutSpace(question, context = {}) {
    const response = await api.post('/ai/ask', {
      question,
      context,
    });
    return response.data;
  }

  /**
   * Get what's visible tonight
   */
  async getWhatsVisibleTonight(astronomyData, satelliteData) {
    const response = await api.post('/ai/visible-tonight', {
      astronomyData,
      satelliteData,
    });
    return response.data;
  }

  /**
   * Explain a satellite
   */
  async explainSatellite(satelliteName, satelliteData) {
    const response = await api.post('/ai/explain-satellite', {
      satelliteName,
      satelliteData,
    });
    return response.data;
  }

  /**
   * Chat endpoint
   */
  async chat(message, context = {}) {
    const response = await api.post('/ai/chat', {
      message,
      context,
    });
    return response.data;
  }
}

export default new AIService();
