import { useState, useEffect } from 'react';
import { friends } from '../api';

export default function AddFriendModal({ onClose, onAdded }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await friends.getRecommendations();
      setRecommendations(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await friends.searchUsers(query.trim());
      setSearchResults(response.data);

      if (response.data.length === 0) {
        setError('No users found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await friends.addFriend(userId);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add friend');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-onyx-gray rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">Add Friend</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-onyx-dark text-white border border-onyx-light rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx-accent"
              placeholder="Search by username..."
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-onyx-accent text-white rounded-lg hover:bg-onyx-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Show recommendations heading */}
        {!query && recommendations.length > 0 && (
          <div className="mb-3">
            <h3 className="text-white font-semibold text-lg">
              People you may know ({recommendations.length})
            </h3>
            <p className="text-gray-400 text-sm">All users on Onyx</p>
          </div>
        )}

        {/* Show search results heading when searching */}
        {query && searchResults.length > 0 && (
          <div className="mb-3">
            <h3 className="text-white font-semibold text-lg">
              Search Results ({searchResults.length})
            </h3>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {/* Show search results if searching, otherwise show recommendations */}
          {(query ? searchResults : recommendations).map((user) => (
            <div key={user.id} className="bg-onyx-dark rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-onyx-accent flex items-center justify-center text-white font-bold">
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold">{user.display_name || user.username}</div>
                  <div className="text-gray-400 text-sm">@{user.username}</div>
                </div>
              </div>

              {user.is_friend ? (
                <span className="text-green-500 text-sm">Already friends</span>
              ) : (
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="px-4 py-2 bg-onyx-accent hover:bg-onyx-accent-dark text-white rounded-lg transition-colors text-sm"
                >
                  Add
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
