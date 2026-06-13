import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key, defaultValue = null) => {
  const value = process.env[key];
  if (!value && defaultValue === null) {
    console.warn(`⚠️  Warning: Environment variable ${key} is not set`);
  }
  return value || defaultValue;
};

export const config = {
  port: getEnv('PORT', 5000),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  
  // API Keys
  n2yoApiKey: getEnv('N2YO_API_KEY'),
  nasaApiKey: getEnv('NASA_API_KEY'),
  astronomyAppId: getEnv('ASTRONOMY_APP_ID'),
  astronomyAppSecret: getEnv('ASTRONOMY_APP_SECRET'),
  geminiApiKey: getEnv('GEMINI_API_KEY'),
  
  // Frontend
  frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:5173'),
  
  // Cache
  cacheDuration: parseInt(getEnv('CACHE_DURATION', 5), 10),
  
  // Derived values
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
