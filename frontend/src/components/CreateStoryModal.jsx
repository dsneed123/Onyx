import { useState, useRef } from 'react';
import { stories, upload } from '../api';

export default function CreateStoryModal({ onClose, onCreated, initialMedia = null }) {
  const [mediaFile, setMediaFile] = useState(initialMedia?.file || null);
  const [mediaPreview, setMediaPreview] = useState(initialMedia?.preview || null);
  const [mediaType, setMediaType] = useState(initialMedia?.type || null);
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const textRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setMediaFile(file);
    const fileType = file.type.startsWith('video') ? 'video' : 'image';
    setMediaType(fileType);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
  };

  const handleDrag = (e) => {
    if (!isDragging) return;

    const container = e.currentTarget.parentElement;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTextPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mediaFile && !text) {
      setError('Please add text or select an image/video');
      return;
    }

    setLoading(true);
    setUploading(true);
    setError('');

    try {
      let mediaUrl = null;

      // Upload media file if present
      if (mediaFile) {
        const uploadResponse = await upload.file(mediaFile);
        mediaUrl = uploadResponse.data.url;
        setUploading(false);
      }

      // Create story with text and/or media
      const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      await stories.create({
        mediaUrl: mediaUrl ? `${apiBaseUrl}${mediaUrl}` : null,
        text: text || '',
        textOverlay: text && mediaFile ? {
          text,
          position: textPosition,
          color: textColor,
          fontSize
        } : null
      });

      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create story');
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="bg-onyx-gray rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-bold">Create Story</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Media Upload */}
          {!mediaPreview ? (
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-onyx-light rounded-lg p-12 text-center cursor-pointer hover:border-onyx-accent transition-colors"
              >
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-white mb-2">Click to upload image or video</p>
                <p className="text-gray-400 text-sm">JPG, PNG, GIF, MP4, MOV (max 50MB)</p>
              </div>
            </div>
          ) : (
            <>
              {/* Media Preview with Text Overlay */}
              <div className="mb-6 relative">
                <div
                  className="relative bg-black rounded-lg overflow-hidden"
                  style={{ aspectRatio: '9/16', maxHeight: '500px' }}
                  onMouseMove={handleDrag}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                >
                  {mediaType === 'image' ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Text Overlay */}
                  {text && (
                    <div
                      ref={textRef}
                      onMouseDown={handleDragStart}
                      style={{
                        position: 'absolute',
                        left: `${textPosition.x}%`,
                        top: `${textPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        color: textColor,
                        fontSize: `${fontSize}px`,
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        padding: '8px',
                        whiteSpace: 'pre-wrap',
                        textAlign: 'center',
                        maxWidth: '80%'
                      }}
                    >
                      {text}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview(null);
                    setMediaType(null);
                  }}
                  className="mt-2 text-gray-400 hover:text-white text-sm"
                >
                  Change media
                </button>
              </div>

              {/* Text Input */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Add Text (optional)
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-onyx-dark text-white border border-onyx-light rounded-lg focus:outline-none focus:ring-2 focus:ring-onyx-accent resize-none"
                  placeholder="Add text to your story... Drag the text on the preview to reposition it!"
                  maxLength={200}
                />
                <div className="text-gray-400 text-sm mt-1 text-right">
                  {text.length}/200
                </div>
              </div>

              {/* Text Customization */}
              {text && (
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Text Color
                    </label>
                    <div className="flex gap-2">
                      {['#ffffff', '#000000', '#ff006e', '#00f5ff', '#ffff00', '#00ff00'].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setTextColor(color)}
                          className={`w-10 h-10 rounded-full border-2 ${
                            textColor === color ? 'border-white' : 'border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Text Size: {fontSize}px
                    </label>
                    <input
                      type="range"
                      min="16"
                      max="48"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="bg-onyx-dark rounded-lg p-4 mb-6">
            <p className="text-gray-400 text-sm">
              <span className="text-onyx-accent font-semibold">Tip:</span> Your text will be automatically
              analyzed and tagged to help others discover your story!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-onyx-light text-white rounded-lg hover:bg-onyx-light/80 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!mediaFile && !text)}
              className="flex-1 px-4 py-3 bg-onyx-accent text-white rounded-lg hover:bg-onyx-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : loading ? 'Creating...' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
