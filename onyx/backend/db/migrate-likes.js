import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Adding likes and permanence features to stories...');

    // Add likes_count and is_permanent columns to stories table
    await client.query(`
      ALTER TABLE stories
      ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS text_overlay JSONB
    `);

    // Create story_likes table to track who liked what
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, story_id)
      )
    `);

    console.log('Migration complete! Stories now support likes and permanence.');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
