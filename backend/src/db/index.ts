import { Pool, PoolClient } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle database client', err);
});

/**
 * Get a client from the pool for executing queries
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Execute a query using the pool
 */
export async function query(text: string, params?: unknown[]) {
  return pool.query(text, params);
}

/**
 * Check if database is connected
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Initialize database schema
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Create comparisons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comparisons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        options TEXT[] NOT NULL,
        constraints TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create comparison_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS comparison_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comparison_id UUID REFERENCES comparisons(id),
        result JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database schema initialized');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
