import axios from 'axios';
import { config } from '../config/env.js';

class GeminiService {
  constructor() {
    this.apiKey = config.geminiApiKey;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.model = 'gemini-pro';
  }

  /**
   * Generate AI response about space/astronomy
   * @param {string} prompt - User question/prompt
   * @param {object} context - Additional context (satellite, asteroid, etc.)
   */
  async generateResponse(prompt, context = {}) {
    try {
      const systemPrompt = `You are AstroNova AI, a professional space operations assistant. 
      You provide concise, accurate explanations about satellites, astronomy, asteroids, and space phenomena.
      Keep responses brief and informative (2-3 sentences max). Use scientific terminology appropriately.`;

      const fullPrompt = context && Object.keys(context).length > 0 
        ? `${systemPrompt}\n\nContext data: ${JSON.stringify(context)}\n\nUser question: ${prompt}`
        : `${systemPrompt}\n\nUser question: ${prompt}`;

      const response = await axios.post(
        `${this.baseURL}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          },
        }
      );

      const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('No response from Gemini API');
      }

      return {
        success: true,
        response: content,
      };
    } catch (error) {
      console.error('Gemini generateResponse error:', error.message);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Answer specific space questions
   * @param {string} question - Question about space
   * @param {object} relatedData - Related satellite/astronomy data
   */
  async askAboutSpace(question, relatedData = {}) {
    return this.generateResponse(question, relatedData);
  }

  /**
   * Get what's visible tonight
   * @param {object} astronomyData - Current astronomy data
   * @param {object} satelliteData - Current satellite data
   */
  async getWhatsVisibleTonight(astronomyData, satelliteData) {
    const prompt = `Based on this data, what celestial objects and satellites are visible tonight?`;
    const context = {
      astronomy: astronomyData,
      satellites: satelliteData,
    };
    return this.generateResponse(prompt, context);
  }

  /**
   * Explain a satellite
   * @param {string} satelliteName - Satellite name
   * @param {object} satelliteData - Satellite data
   */
  async explainSatellite(satelliteName, satelliteData) {
    const prompt = `Tell me about the ${satelliteName} satellite in simple terms.`;
    const context = {
      satellite: satelliteData,
    };
    return this.generateResponse(prompt, context);
  }
}

export default new GeminiService();
