import apiClient from './client';

// Auth API
export const auth = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

// Users API
export const users = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data) => apiClient.put('/users/me', data),
  getUser: (id) => apiClient.get(`/users/${id}`),
};

// Friends API
export const friends = {
  getFriends: () => apiClient.get('/friends'),
  addFriend: (friendId) => apiClient.post('/friends', { friendId }),
  removeFriend: (friendId) => apiClient.delete(`/friends/${friendId}`),
  searchUsers: (query) => apiClient.get('/friends/search', { params: { query } }),
  getRecommendations: () => apiClient.get('/friends/recommendations'),
};

// Snaps API
export const snaps = {
  send: (data) => apiClient.post('/snaps', data),
  getReceived: () => apiClient.get('/snaps/received'),
  getSent: () => apiClient.get('/snaps/sent'),
  markViewed: (id) => apiClient.post(`/snaps/${id}/view`),
};

// Stories API
export const stories = {
  create: (data) => apiClient.post('/stories', data),
  getFeed: (limit) => apiClient.get('/stories/feed', { params: { limit } }),
  getMyStories: () => apiClient.get('/stories/my-stories'),
  swipe: (id, direction) => apiClient.post(`/stories/${id}/swipe`, { direction }),
  like: (id) => apiClient.post(`/stories/${id}/like`),
  unlike: (id) => apiClient.post(`/stories/${id}/unlike`),
  checkLiked: (id) => apiClient.get(`/stories/${id}/liked`),
  delete: (id) => apiClient.delete(`/stories/${id}`),
};

// Upload API
export const upload = {
  file: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
