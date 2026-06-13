import express from 'express';
import 'express-async-errors';
import { config } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import healthRoutes from './routes/health.js';
import satelliteRoutes from './routes/satellites.js';
import astronomyRoutes from './routes/astronomy.js';
import nasaRoutes from './routes/nasa.js';
import aiRoutes from './routes/ai.js';

const app = express();

// ========== MIDDLEWARE ==========
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========== ROUTES ==========
app.use('/api/health', healthRoutes);
app.use('/api/satellites', satelliteRoutes);
app.use('/api/astronomy', astronomyRoutes);
app.use('/api/nasa', nasaRoutes);
app.use('/api/ai', aiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'AstroNova Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      satellites: '/api/satellites',
      astronomy: '/api/astronomy',
      nasa: '/api/nasa',
      ai: '/api/ai',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// ========== ERROR HANDLER ==========
app.use(errorHandler);

// ========== SERVER START ==========
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 AstroNova Backend Server           ║
║  Environment: ${config.isDevelopment ? 'DEVELOPMENT' : 'PRODUCTION'}                ║
║  Port: ${PORT}                              ║
║  URL: http://localhost:${PORT}             ║
╚════════════════════════════════════════╝
  `);
});
