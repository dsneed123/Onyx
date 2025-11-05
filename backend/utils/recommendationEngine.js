import pool from '../db/index.js';

// Update user interest scores based on swipe
export async function updateUserInterests(userId, storyId, direction) {
  try {
    // Get tags for the story
    const tagResult = await pool.query(
      `SELECT t.id, t.tag_name
       FROM tags t
       JOIN story_tags st ON t.id = st.tag_id
       WHERE st.story_id = $1`,
      [storyId]
    );

    const tags = tagResult.rows;

    // Update interest scores
    // Right swipe (like) increases score, left swipe decreases
    const scoreChange = direction === 'right' ? 1.0 : -0.5;

    for (const tag of tags) {
      await pool.query(
        `INSERT INTO user_interests (user_id, tag_id, score, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, tag_id)
         DO UPDATE SET
           score = user_interests.score + $3,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, tag.id, scoreChange]
      );
    }
  } catch (error) {
    console.error('Error updating user interests:', error);
  }
}

// Get recommended stories for a user
export async function getRecommendedStories(userId, limit = 20) {
  try {
    // Get user's interest scores
    const interestsResult = await pool.query(
      `SELECT tag_id, score
       FROM user_interests
       WHERE user_id = $1 AND score > 0
       ORDER BY score DESC
       LIMIT 10`,
      [userId]
    );

    const userInterests = interestsResult.rows;

    // If user has no interests yet, return random recent stories
    if (userInterests.length === 0) {
      const randomStories = await pool.query(
        `SELECT DISTINCT s.*, u.username, u.display_name, u.avatar_url,
                COALESCE(array_agg(DISTINCT t.tag_name) FILTER (WHERE t.id IS NOT NULL), '{}') as tags
         FROM stories s
         JOIN users u ON s.user_id = u.id
         LEFT JOIN story_tags st ON s.id = st.story_id
         LEFT JOIN tags t ON st.tag_id = t.id
         WHERE s.expires_at > CURRENT_TIMESTAMP
           AND s.user_id != $1
           AND NOT EXISTS (
             SELECT 1 FROM story_views sv
             WHERE sv.story_id = s.id AND sv.user_id = $1
           )
         GROUP BY s.id, u.id
         ORDER BY s.created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return randomStories.rows;
    }

    // Get stories matching user interests
    const recommendedStories = await pool.query(
      `SELECT DISTINCT s.*, u.username, u.display_name, u.avatar_url,
              COALESCE(array_agg(DISTINCT t.tag_name) FILTER (WHERE t.id IS NOT NULL), '{}') as tags,
              SUM(ui.score) as relevance_score
       FROM stories s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN story_tags st ON s.id = st.story_id
       LEFT JOIN tags t ON st.tag_id = t.id
       LEFT JOIN user_interests ui ON ui.tag_id = st.tag_id AND ui.user_id = $1
       WHERE s.expires_at > CURRENT_TIMESTAMP
         AND s.user_id != $1
         AND NOT EXISTS (
           SELECT 1 FROM story_views sv
           WHERE sv.story_id = s.id AND sv.user_id = $1
         )
       GROUP BY s.id, u.id
       ORDER BY relevance_score DESC NULLS LAST, s.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return recommendedStories.rows;
  } catch (error) {
    console.error('Error getting recommended stories:', error);
    return [];
  }
}

// Mark story as viewed
export async function markStoryViewed(userId, storyId) {
  try {
    await pool.query(
      `INSERT INTO story_views (user_id, story_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, story_id) DO NOTHING`,
      [userId, storyId]
    );

    // Increment view count
    await pool.query(
      'UPDATE stories SET view_count = view_count + 1 WHERE id = $1',
      [storyId]
    );
  } catch (error) {
    console.error('Error marking story as viewed:', error);
  }
}
