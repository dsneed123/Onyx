// Extract tags from text using simple natural language processing
// Tags are extracted from meaningful words (nouns, adjectives, etc.)

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'i', 'me', 'my', 'we', 'you', 'your',
  'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where',
  'who', 'which', 'why', 'how', 'am', 'been', 'being', 'do', 'does',
  'did', 'doing', 'would', 'should', 'could', 'ought', 'im', 'youre',
  'hes', 'shes', 'its', 'were', 'theyre', 'ive', 'youve', 'weve',
  'theyve', 'id', 'youd', 'hed', 'shed', 'wed', 'theyd', 'ill',
  'youll', 'hell', 'shell', 'well', 'theyll', 'isnt', 'arent',
  'wasnt', 'werent', 'hasnt', 'havent', 'hadnt', 'doesnt', 'dont',
  'didnt', 'wont', 'wouldnt', 'shant', 'shouldnt', 'cant', 'cannot',
  'couldnt', 'mustnt', 'lets', 'thats', 'whos', 'whats', 'heres',
  'theres', 'whens', 'wheres', 'whys', 'hows', 'so', 'than', 'too',
  'very', 'can', 'just', 'now', 'then', 'there', 'here', 'not', 'no'
]);

const EMOJI_CATEGORIES = {
  '😀😃😄😁😆😅🤣😂🙂🙃😉😊😇': 'happy',
  '🥰😍🤩😘😗😚😙': 'love',
  '😋😛😜🤪😝': 'playful',
  '🤗🤭🤫🤔': 'thinking',
  '🤐😐😑😶': 'neutral',
  '😏😒🙄😬🤥': 'suspicious',
  '😌😔😪🤤😴': 'tired',
  '😷🤒🤕🤢🤮': 'sick',
  '🥳🤠🤡': 'party',
  '😎🤓': 'cool',
  '😭😢😥😰😨😱': 'sad',
  '😡😠🤬': 'angry',
  '💪🏋️🤸🏃🚴': 'fitness',
  '🎮🎯🎲🎰': 'gaming',
  '🎵🎶🎸🎹🎤': 'music',
  '📷📸🎥🎬': 'photography',
  '🍕🍔🍟🌮🍿': 'food',
  '☕🍵🧃🍺🍻': 'drinks',
  '✈️🚗🚙🏖️🏝️': 'travel',
  '🏀⚽🏈⚾🎾': 'sports',
  '🐶🐱🐭🐹🐰': 'pets',
  '🌸🌺🌻🌹🌷': 'nature',
  '💼👔🏢': 'work',
  '📚📖✏️📝': 'education',
  '❤️💙💚💛💜': 'love',
  '🔥💯✨⭐': 'trending'
};

export function extractTags(text) {
  if (!text) return [];

  const tags = new Set();

  // Extract hashtags
  const hashtags = text.match(/#(\w+)/g);
  if (hashtags) {
    hashtags.forEach(tag => {
      tags.add(tag.slice(1).toLowerCase());
    });
  }

  // Extract emoji-based tags
  for (const [emojis, category] of Object.entries(EMOJI_CATEGORIES)) {
    for (const emoji of emojis) {
      if (text.includes(emoji)) {
        tags.add(category);
        break;
      }
    }
  }

  // Extract meaningful words (simple approach)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word =>
      word.length > 3 &&
      !STOP_WORDS.has(word) &&
      !/^\d+$/.test(word)
    );

  // Add top words as tags (limit to avoid too many tags)
  words.slice(0, 5).forEach(word => tags.add(word));

  // Common topic detection (simple keyword matching)
  const topicKeywords = {
    'workout': ['workout', 'gym', 'exercise', 'training', 'fitness'],
    'food': ['food', 'eating', 'meal', 'lunch', 'dinner', 'breakfast'],
    'travel': ['travel', 'trip', 'vacation', 'journey', 'adventure'],
    'fashion': ['outfit', 'style', 'fashion', 'clothes', 'wearing'],
    'selfie': ['selfie', 'face', 'look', 'looking'],
    'party': ['party', 'club', 'night', 'nightout', 'drinks'],
    'study': ['study', 'studying', 'homework', 'exam', 'school'],
    'work': ['work', 'working', 'office', 'meeting', 'project'],
    'gaming': ['game', 'gaming', 'playing', 'gamer', 'stream'],
    'music': ['music', 'song', 'concert', 'listening', 'singing'],
    'art': ['art', 'drawing', 'painting', 'creative', 'artist'],
    'nature': ['nature', 'outdoor', 'hiking', 'beach', 'mountain'],
    'pets': ['dog', 'cat', 'puppy', 'kitten', 'pet'],
    'mood': ['feeling', 'mood', 'vibes', 'energy']
  };

  const lowerText = text.toLowerCase();
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      tags.add(topic);
    }
  }

  return Array.from(tags);
}

export async function createOrGetTags(pool, tagNames) {
  const tags = [];

  for (const tagName of tagNames) {
    try {
      // Try to get existing tag
      let result = await pool.query(
        'SELECT * FROM tags WHERE tag_name = $1',
        [tagName]
      );

      if (result.rows.length === 0) {
        // Create new tag
        result = await pool.query(
          'INSERT INTO tags (tag_name) VALUES ($1) RETURNING *',
          [tagName]
        );
      }

      tags.push(result.rows[0]);
    } catch (error) {
      console.error('Error creating/getting tag:', error);
    }
  }

  return tags;
}
