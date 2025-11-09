import postgres from 'postgres';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQL client with persistent connection pool
let _sql: ReturnType<typeof postgres> | null = null;

// Get or create SQL client with persistent connection pool
function getSQL(): ReturnType<typeof postgres> {
  if (!_sql) {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('Please add your Neon database connection string to .env:');
      console.log('DATABASE_URL=postgresql://user:password@host/database');
      process.exit(1);
    }

    // Create postgres client with production-ready connection pooling
    _sql = postgres(DATABASE_URL, {
      // Connection pool configuration
      max: 20, // Maximum 20 connections (supports 1000+ concurrent users)
      idle_timeout: 30, // Close idle connections after 30 seconds
      max_lifetime: 60 * 60, // Recycle connections after 1 hour
      connect_timeout: 10, // Connection timeout in seconds

      // Error handling
      onnotice: () => {}, // Suppress notices in production

      // Connection management
      connection: {
        application_name: 'scotland-yard-game',
      },

      // Transform column names from snake_case to camelCase
      transform: {
        column: {
          to: postgres.toCamel,
          from: postgres.fromCamel,
        },
      },
    });

    console.log('✅ PostgreSQL connection pool initialized (max: 20 connections)');
  }

  return _sql;
}

// Export sql client - uses persistent connection pool
export const sql = getSQL();

// Graceful shutdown - close all connections
export async function closeDatabase(): Promise<void> {
  if (_sql) {
    console.log('🔌 Closing database connections...');
    await _sql.end({ timeout: 5 });
    _sql = null;
    console.log('✅ Database connections closed');
  }
}

/**
 * Initialize database schema
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await sql`SELECT 1 as health_check`;
    console.log('✅ Database connection successful');

    // Read schema file
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    // Remove comments and split into individual statements
    const cleanedSchema = schema
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);

    // Execute each statement individually
    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log('✅ Database schema initialized');

    // Run migrations
    await runMigrations();
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Run database migrations
 */
async function runMigrations(): Promise<void> {
  try {
    const migrationsDir = path.join(__dirname, '../db/migrations');

    // Check if migrations directory exists
    try {
      await fs.access(migrationsDir);
    } catch {
      console.log('No migrations directory found, skipping migrations');
      return;
    }

    // Read all migration files
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();

    if (migrationFiles.length === 0) {
      console.log('No migrations found');
      return;
    }

    console.log(`Running ${migrationFiles.length} migrations...`);

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const migration = await fs.readFile(migrationPath, 'utf-8');

      // Remove comments and split into statements
      const statements = migration
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await sql.unsafe(statement);
      }

      console.log(`✅ Applied migration: ${file}`);
    }
  } catch (error) {
    console.error('❌ Failed to run migrations:', error);
    // Don't throw - migrations are optional and shouldn't break the app
  }
}

/**
 * Clean up old games (older than 24 hours)
 */
export async function cleanupOldGames(): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM games
      WHERE updated_at < NOW() - INTERVAL '24 hours'
      RETURNING id
    `;

    if (result.length > 0) {
      console.log(`🗑️  Cleaned up ${result.length} old games`);
    }
  } catch (error) {
    console.error('❌ Failed to cleanup old games:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupOldGames, 60 * 60 * 1000);
