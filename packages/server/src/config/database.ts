import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQL client will be initialized lazily
let _sql: NeonQueryFunction<false, false> | null = null;

// Get or create SQL client
function getSQL(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('Please add your Neon database connection string to .env:');
      console.log('DATABASE_URL=postgresql://user:password@host/database');
      process.exit(1);
    }

    // Configure Neon client with increased timeout and connection pooling
    _sql = neon(DATABASE_URL, {
      fetchOptions: {
        // Increase timeout to 30 seconds for Railway environment
        signal: AbortSignal.timeout(30000),
      },
      // Enable connection caching for better performance
      fetchConnectionCache: true,
    });
  }

  return _sql;
}

// Helper function to retry async operations with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`⚠️  SQL query attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Export sql wrapper with automatic retry logic for all queries
export const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  return retryWithBackoff(() => getSQL()(strings, ...values), 3, 1000);
}) as unknown as NeonQueryFunction<false, false>;

/**
 * Initialize database schema
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection first
    console.log('🔌 Testing database connection...');
    await retryWithBackoff(async () => {
      await sql`SELECT 1 as health_check`;
      console.log('✅ Database connection successful');
    }, 4, 2000); // More retries for initial connection

    // Initialize schema with retry logic
    await retryWithBackoff(async () => {
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

      // Execute each statement individually using tagged template syntax
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        // Manually construct a tagged template call for each statement
        const templateStrings = Object.assign([statement], { raw: [statement] });
        await sql(templateStrings as any);
      }

      console.log('✅ Database schema initialized');
    }, 3, 2000);

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
        const templateStrings = Object.assign([statement], { raw: [statement] });
        await sql(templateStrings as any);
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
