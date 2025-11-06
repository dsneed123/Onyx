import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: 'postgres', // Connect to default database first
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('Creating database if not exists...');
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log('Database created!');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database already exists');
    } else {
      throw error;
    }
  } finally {
    client.release();
  }

  // Connect to the onyx database
  const onyxPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  const onyxClient = await onyxPool.connect();

  try {
    console.log('Creating tables...');

    // Users table
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        avatar_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Friendships table
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `);

    // Streaks table
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        count INTEGER DEFAULT 0,
        last_snap_at TIMESTAMP,
        UNIQUE(user_id, friend_id)
      )
    `);

    // Snaps table
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS snaps (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        media_url VARCHAR(255),
        text TEXT,
        viewed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);

    // Stories table
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS stories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        media_url VARCHAR(255),
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        view_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        is_permanent BOOLEAN DEFAULT FALSE,
        text_overlay JSONB,
        duration_hours INTEGER,
        post_type VARCHAR(20) DEFAULT 'story'
      )
    `);

    // Tags table
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        tag_name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Story tags junction table
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS story_tags (
        id SERIAL PRIMARY KEY,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(story_id, tag_id)
      )
    `);

    // Swipes table (for tracking user engagement)
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS swipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        direction VARCHAR(10) NOT NULL, -- 'right' (like) or 'left' (skip)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User interests (calculated from swipes and tags)
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS user_interests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        score FLOAT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tag_id)
      )
    `);

    // Story views (to avoid showing same story twice)
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS story_views (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, story_id)
      )
    `);

    // Story likes (reactions)
    await onyxClient.query(`
      CREATE TABLE IF NOT EXISTS story_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        reaction_type VARCHAR(20) DEFAULT 'like',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, story_id)
      )
    `);

    console.log('All tables created successfully!');
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    onyxClient.release();
    await onyxPool.end();
  }

  await pool.end();
}

setupDatabase().catch(console.error);
