import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { extractTags, createOrGetTags } from '../utils/tagExtractor.js';
import { getRecommendedStories, updateUserInterests, markStoryViewed } from '../utils/recommendationEngine.js';

const router = express.Router();

// Create a story
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { text, mediaUrl, textOverlay } = req.body;
    const userId = req.user.id;

    if (!mediaUrl && !text) {
      return res.status(400).json({ error: 'Story must have text or media' });
    }

    // Extract tags from text
    const tagNames = extractTags(text || '');

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create story with text overlay data
    const result = await pool.query(
      `INSERT INTO stories (user_id, text, media_url, text_overlay, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, text, mediaUrl, JSON.stringify(textOverlay || null), expiresAt]
    );

    const story = result.rows[0];

    // Create/get tags and associate with story
    if (tagNames.length > 0) {
      const tags = await createOrGetTags(pool, tagNames);

      for (const tag of tags) {
        await pool.query(
          'INSERT INTO story_tags (story_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [story.id, tag.id]
        );
      }
    }

    res.status(201).json({
      ...story,
      tags: tagNames
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recommended stories feed
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const stories = await getRecommendedStories(userId, limit);

    res.json(stories);
  } catch (error) {
    console.error('Error getting story feed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Swipe on a story
router.post('/:id/swipe', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body; // 'left' or 'right'
    const userId = req.user.id;

    if (!['left', 'right'].includes(direction)) {
      return res.status(400).json({ error: 'Invalid swipe direction' });
    }

    // Record swipe
    await pool.query(
      'INSERT INTO swipes (user_id, story_id, direction) VALUES ($1, $2, $3)',
      [userId, id, direction]
    );

    // Mark as viewed
    await markStoryViewed(userId, id);

    // Update user interests based on swipe
    await updateUserInterests(userId, id, direction);

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording swipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's own stories
router.get('/my-stories', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT s.*, COALESCE(array_agg(DISTINCT t.tag_name) FILTER (WHERE t.id IS NOT NULL), '{}') as tags
       FROM stories s
       LEFT JOIN story_tags st ON s.id = st.story_id
       LEFT JOIN tags t ON st.tag_id = t.id
       WHERE s.user_id = $1 AND s.expires_at > CURRENT_TIMESTAMP
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting user stories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like a story
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Insert like (will fail silently if already liked)
    await pool.query(
      'INSERT INTO story_likes (user_id, story_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, id]
    );

    // Update likes count
    const result = await pool.query(
      `UPDATE stories
       SET likes_count = likes_count + 1
       WHERE id = $1
       RETURNING likes_count`,
      [id]
    );

    const likesCount = result.rows[0]?.likes_count || 0;

    // Check if story reached 1M likes - make it permanent!
    if (likesCount >= 1000000) {
      await pool.query(
        'UPDATE stories SET is_permanent = TRUE WHERE id = $1',
        [id]
      );
    }

    res.json({ success: true, likes_count: likesCount });
  } catch (error) {
    console.error('Error liking story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlike a story
router.post('/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Remove like
    const deleteResult = await pool.query(
      'DELETE FROM story_likes WHERE user_id = $1 AND story_id = $2 RETURNING *',
      [userId, id]
    );

    // Only decrement if like existed
    if (deleteResult.rows.length > 0) {
      const result = await pool.query(
        `UPDATE stories
         SET likes_count = GREATEST(likes_count - 1, 0)
         WHERE id = $1
         RETURNING likes_count`,
        [id]
      );

      const likesCount = result.rows[0]?.likes_count || 0;
      res.json({ success: true, likes_count: likesCount });
    } else {
      res.json({ success: false, message: 'Story was not liked' });
    }
  } catch (error) {
    console.error('Error unliking story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user liked a story
router.get('/:id/liked', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM story_likes WHERE user_id = $1 AND story_id = $2',
      [userId, id]
    );

    res.json({ liked: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a story
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM stories WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
