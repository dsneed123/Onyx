import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send a snap
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { receiverId, text, mediaUrl } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID required' });
    }

    if (!text && !mediaUrl) {
      return res.status(400).json({ error: 'Snap must have text or media' });
    }

    // Check if users are friends
    const friendshipCheck = await pool.query(
      'SELECT * FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [senderId, receiverId]
    );

    if (friendshipCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Can only send snaps to friends' });
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create snap
    const result = await pool.query(
      `INSERT INTO snaps (sender_id, receiver_id, text, media_url, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [senderId, receiverId, text, mediaUrl, expiresAt]
    );

    const snap = result.rows[0];

    // Update streak
    await updateStreak(senderId, receiverId);

    res.status(201).json(snap);
  } catch (error) {
    console.error('Error sending snap:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get received snaps
router.get('/received', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT s.*, u.username, u.display_name, u.avatar_url
       FROM snaps s
       JOIN users u ON s.sender_id = u.id
       WHERE s.receiver_id = $1 AND s.expires_at > CURRENT_TIMESTAMP
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting received snaps:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sent snaps
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT s.*, u.username, u.display_name, u.avatar_url
       FROM snaps s
       JOIN users u ON s.receiver_id = u.id
       WHERE s.sender_id = $1 AND s.expires_at > CURRENT_TIMESTAMP
       ORDER BY s.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting sent snaps:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark snap as viewed
router.post('/:id/view', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE snaps SET viewed = true WHERE id = $1 AND receiver_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snap not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking snap as viewed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to update streak
async function updateStreak(userId, friendId) {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get current streak
    const streakResult = await pool.query(
      'SELECT * FROM streaks WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    );

    if (streakResult.rows.length === 0) {
      // Create new streak
      await pool.query(
        'INSERT INTO streaks (user_id, friend_id, count, last_snap_at) VALUES ($1, $2, 1, $3)',
        [userId, friendId, now]
      );
    } else {
      const streak = streakResult.rows[0];
      const lastSnap = new Date(streak.last_snap_at);

      // Check if last snap was within the last 24-48 hours
      const hoursSinceLastSnap = (now - lastSnap) / (1000 * 60 * 60);

      if (hoursSinceLastSnap < 24) {
        // Same day, don't increment
        return;
      } else if (hoursSinceLastSnap < 48) {
        // Within streak window, increment
        await pool.query(
          'UPDATE streaks SET count = count + 1, last_snap_at = $1 WHERE id = $2',
          [now, streak.id]
        );
      } else {
        // Streak broken, reset to 1
        await pool.query(
          'UPDATE streaks SET count = 1, last_snap_at = $1 WHERE id = $2',
          [now, streak.id]
        );
      }
    }
  } catch (error) {
    console.error('Error updating streak:', error);
  }
}

export default router;
