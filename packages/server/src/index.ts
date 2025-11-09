import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSocketIO } from './socket/server.js';
import { initializeDatabase } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '../../.env' });

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Serve client static files in production
if (process.env.NODE_ENV === 'production') {
  // __dirname is packages/server/src, need to go up to packages/client/dist
  const clientBuildPath = path.join(__dirname, '../../client/dist');
  console.log(`📦 Serving client from: ${clientBuildPath}`);
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
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`🎮 Socket.IO game server ready`);
      console.log(`💾 Neon database connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');

  // Close HTTP server
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  httpServer.close(() => {
    process.exit(0);
  });
});

export { app };
