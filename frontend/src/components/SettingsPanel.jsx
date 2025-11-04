import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { users } from '../api';

export default function SettingsPanel() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.display_name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await users.updateMe({ displayName });
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-onyx-darker overflow-y-auto">
      {/* Header */}
      <div className="bg-onyx-gray border-b border-onyx-light p-4">
        <h1 className="text-white text-2xl font-bold">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <div className="bg-onyx-gray rounded-lg p-6">
          <h2 className="text-white text-xl font-bold mb-4">Profile</h2>

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-onyx-accent flex items-center justify-center text-white font-bold text-3xl">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-white text-xl font-semibold">{user?.displayName || user?.display_name || user?.username}</div>
              <div className="text-gray-400">@{user?.username}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Username</label>
              <div className="px-4 py-3 bg-onyx-dark text-gray-500 rounded-lg">
                {user?.username}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <div className="px-4 py-3 bg-onyx-dark text-gray-500 rounded-lg">
                {user?.email}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Display Name</label>
              {editing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-onyx-dark text-white border border-onyx-light rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx-accent"
                  placeholder="Enter display name"
                />
              ) : (
                <div className="px-4 py-3 bg-onyx-dark text-white rounded-lg">
                  {user?.displayName || user?.display_name || 'Not set'}
                </div>
              )}
            </div>

            {editing ? (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditing(false);
                    setDisplayName(user?.displayName || user?.display_name || '');
                  }}
                  className="flex-1 px-4 py-3 bg-onyx-light text-white rounded-lg hover:bg-onyx-light/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-onyx-accent text-white rounded-lg hover:bg-onyx-accent-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full px-4 py-3 bg-onyx-accent text-white rounded-lg hover:bg-onyx-accent-dark transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-onyx-gray rounded-lg p-6">
          <h2 className="text-white text-xl font-bold mb-4">Account Info</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Member since</span>
              <span className="text-white">
                {new Date(user?.createdAt || user?.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-onyx-gray rounded-lg p-6">
          <h2 className="text-white text-xl font-bold mb-4">About Onyx</h2>

          <div className="space-y-3 text-sm text-gray-400">
            <p>Version 1.0.0</p>
            <p>A social media app with Snapchat-like features</p>

            <div className="pt-4 space-y-2">
              <h3 className="text-white font-semibold">Features:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Send snaps to friends</li>
                <li>Track streaks with friends</li>
                <li>Create and share stories</li>
                <li>Swipe-based story discovery</li>
                <li>Smart recommendations based on your interests</li>
                <li>Auto-tagging from text content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full px-4 py-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
        >
          Logout
        </button>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          Made with ❤️ using React & Node.js
        </div>
      </div>
    </div>
  );
}
