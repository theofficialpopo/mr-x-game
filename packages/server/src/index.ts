import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSocketIO } from './socket/server.js';
import { initializeDatabase, closeDatabase } from './config/database.js';
import { logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '../../.env' });

// Validate environment variables
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url().optional()
});

try {
  envSchema.parse(process.env);
  logger.info('✅ Environment variables validated');
} catch (error) {
  if (error instanceof z.ZodError) {
    logger.error('❌ Environment variable validation failed:');
    error.errors.forEach((err) => {
      logger.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
}

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : (process.env.CLIENT_URL || 'http://localhost:3000'),
  credentials: true,
  methods: ['GET', 'POST']
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.mapbox.com", "wss:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
      scriptSrc: ["'self'", "https://api.mapbox.com"],
      imgSrc: ["'self'", "data:", "https://*.mapbox.com"],
      workerSrc: ["'self'", "blob:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Stricter rate limiting for health check
const healthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // limit each IP to 10 health check requests per minute
});

// Health check endpoint
app.get('/health', healthLimiter, (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve client static files in production
if (process.env.NODE_ENV === 'production') {
  // __dirname is packages/server/src, need to go up to packages/client/dist
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  logger.info(`📦 Serving client from: ${clientBuildPath}`);
  app.use(express.static(clientBuildPath));

  // SPA catch-all route (must be after all API routes)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

// Initialize server
async function startServer() {
  try {
    // Initialize database schema
    await initializeDatabase();

    // Initialize Socket.IO with game logic
    const io = initializeSocketIO(httpServer);

    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running on http://0.0.0.0:${PORT}`);
      logger.info(`🎮 Socket.IO game server ready`);
      logger.info(`💾 Neon database connected`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  logger.info(`\n🛑 Received ${signal}, shutting down gracefully...`);

  // Close HTTP server (stops accepting new connections)
  httpServer.close(async () => {
    logger.info('✅ HTTP server closed');

    // Close database connections
    await closeDatabase();

    logger.info('✅ Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    logger.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { app };
