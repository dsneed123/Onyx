import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Add friend
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    if (!friendId) {
      return res.status(400).json({ error: 'Friend ID required' });
    }

    if (friendId === userId) {
      return res.status(400).json({ error: 'Cannot add yourself as friend' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [friendId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    const existingFriendship = await pool.query(
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    );

    if (existingFriendship.rows.length > 0) {
      return res.status(409).json({ error: 'Already friends' });
    }

    // Create bidirectional friendship
    await pool.query(
      'INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2), ($2, $1)',
      [userId, friendId]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error adding friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get friends list with streaks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url,
              f.created_at as friend_since,
              COALESCE(s.count, 0) as streak_count,
              s.last_snap_at as last_snap
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       LEFT JOIN streaks s ON (s.user_id = f.user_id AND s.friend_id = f.friend_id)
       WHERE f.user_id = $1
       ORDER BY streak_count DESC, u.username ASC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove friend
router.delete('/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    // Delete bidirectional friendship
    await pool.query(
      'DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const result = await pool.query(
      `SELECT u.id, u.username, u.display_name, u.avatar_url,
              EXISTS(SELECT 1 FROM friendships WHERE user_id = $1 AND friend_id = u.id) as is_friend
       FROM users u
       WHERE u.id != $1 AND (u.username ILIKE $2 OR u.display_name ILIKE $2)
       LIMIT 20`,
      [userId, `%${query}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
