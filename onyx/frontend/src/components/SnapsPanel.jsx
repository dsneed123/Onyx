import { useState, useEffect } from 'react';
import { friends, snaps } from '../api';
import ChatView from './ChatView';
import AddFriendModal from './AddFriendModal';

export default function SnapsPanel() {
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await friends.getFriends();
      setFriendsList(response.data);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friendsList.filter(friend =>
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedFriend) {
    return (
      <ChatView
        friend={selectedFriend}
        onBack={() => setSelectedFriend(null)}
        onRefresh={loadFriends}
      />
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-onyx-darker to-onyx-dark flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/5 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-2xl font-bold">Chats</h1>
          <button
            onClick={() => setShowAddFriendModal(true)}
            className="p-2.5 rounded-full bg-gradient-to-br from-onyx-accent to-onyx-purple hover:scale-110 active:scale-95 transition-transform shadow-glow"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-onyx-accent/50 focus:border-transparent transition-all"
          />
          <svg className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-12 h-12 border-4 border-onyx-accent border-t-transparent rounded-full"></div>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="glass p-12 rounded-3xl max-w-md">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-onyx-accent to-onyx-purple rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                {searchQuery ? 'No friends found' : 'No friends yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery ? 'Try a different search' : 'Add friends to start chatting!'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddFriendModal(true)}
                  className="btn-primary px-6 py-3 bg-gradient-to-r from-onyx-accent to-onyx-purple hover:from-onyx-accent-dark hover:to-purple-600 text-white rounded-xl font-semibold shadow-glow transition-all"
                >
                  Add Friends
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => setSelectedFriend(friend)}
                className="w-full glass hover:bg-white/10 rounded-2xl p-4 transition-all group animate-slide-up"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-onyx-accent via-onyx-purple to-onyx-cyan flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                      {friend.username?.[0]?.toUpperCase()}
                    </div>
                    {friend.streak_count > 0 && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-onyx-dark">
                        {friend.streak_count}
                      </div>
                    )}
                  </div>

                  {/* Friend Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white font-semibold text-base">
                        {friend.display_name || friend.username}
                      </h3>
                      {friend.last_snap && (
                        <span className="text-xs text-gray-400">
                          {new Date(friend.last_snap).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 text-sm">@{friend.username}</p>
                      {friend.streak_count > 0 && (
                        <div className="flex items-center gap-1 text-orange-400">
                          <span className="text-sm">🔥</span>
                          <span className="text-xs font-semibold">{friend.streak_count} day streak</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <AddFriendModal
          onClose={() => setShowAddFriendModal(false)}
          onAdded={() => {
            setShowAddFriendModal(false);
            loadFriends();
          }}
        />
      )}
    </div>
  );
}
