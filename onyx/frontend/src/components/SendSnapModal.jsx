import { useState } from 'react';
import { snaps } from '../api';

export default function SendSnapModal({ friend, onClose, onSent }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await snaps.send({
        receiverId: friend.id,
        text: text.trim()
      });
      onSent();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send snap');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-onyx-gray rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">Send Snap</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 flex items-center gap-3 p-4 bg-onyx-dark rounded-lg">
          <div className="w-12 h-12 rounded-full bg-onyx-accent flex items-center justify-center text-white font-bold text-lg">
            {friend.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold">{friend.display_name || friend.username}</div>
            <div className="text-gray-400 text-sm">@{friend.username}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-32 px-4 py-3 bg-onyx-dark text-white border border-onyx-light rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx-accent resize-none"
              placeholder="Type your message..."
              maxLength={200}
            />
            <div className="text-gray-400 text-sm mt-2 text-right">
              {text.length}/200
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-onyx-light text-white rounded-lg hover:bg-onyx-light/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="flex-1 px-4 py-3 bg-onyx-accent text-white rounded-lg hover:bg-onyx-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Snap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
