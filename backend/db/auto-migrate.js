import pool from './index.js';

export async function runAutoMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Checking database schema...');

    // Check if text_overlay column exists
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'stories' AND column_name = 'text_overlay';
    `);

    if (columnCheck.rows.length === 0) {
      console.log('⚠️  Missing columns detected. Running migration...');

      // Add missing columns to stories table
      await client.query(`
        ALTER TABLE stories
        ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_permanent BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS text_overlay JSONB;
      `);
      console.log('✅ Stories table columns added');

      // Create story_likes table
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

      console.log('🎉 Auto-migration completed successfully!');
    } else {
      console.log('✅ Database schema is up to date');
    }
  } catch (error) {
    console.error('❌ Auto-migration failed:', error);
    // Don't throw - let the server start anyway
  } finally {
    client.release();
  }
}
