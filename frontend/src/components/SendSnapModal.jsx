import { useState, useRef } from 'react';
import { snaps, upload } from '../api';

export default function SendSnapModal({ friend, onClose, onSent }) {
  const [text, setText] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !mediaFile) {
      setError('Please enter some text or attach an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let mediaUrl = null;

      // Upload image if present
      if (mediaFile) {
        setUploading(true);
        const uploadResponse = await upload.file(mediaFile);
        mediaUrl = uploadResponse.data.url;
        setUploading(false);
      }

      const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

      await snaps.send({
        receiverId: friend.id,
        text: text.trim() || '',
        mediaUrl: mediaUrl ? `${apiBaseUrl}${mediaUrl}` : null
      });
      onSent();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send snap');
      setLoading(false);
      setUploading(false);
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

          {/* Image Upload */}
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!mediaPreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-onyx-light rounded-lg p-6 text-center hover:border-onyx-accent transition-colors"
              >
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white text-sm">Click to attach an image</p>
                <p className="text-gray-400 text-xs mt-1">JPG, PNG, GIF (optional)</p>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Message (optional)
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
              disabled={loading || (!text.trim() && !mediaFile)}
              className="flex-1 px-4 py-3 bg-onyx-accent text-white rounded-lg hover:bg-onyx-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : loading ? 'Sending...' : 'Send Snap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
