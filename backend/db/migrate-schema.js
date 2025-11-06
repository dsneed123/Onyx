import pool from './index.js';

async function migrateSchema() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting schema migration...');

    // Add missing columns to stories table
    console.log('📝 Adding columns to stories table...');
    await client.query(`
      ALTER TABLE stories
      ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS text_overlay JSONB;
    `);
    console.log('✅ Stories table columns added');

    // Create story_likes table
    console.log('📝 Creating story_likes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS story_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, story_id)
      );
    `);
    console.log('✅ story_likes table created');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateSchema().catch(console.error);
