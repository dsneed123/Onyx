import { useState, useEffect, useRef } from 'react';
import { snaps, upload } from '../api';
import { useAuth } from '../context/AuthContext';
import MediaCapture from './MediaCapture';
import SnapViewer from './SnapViewer';

export default function ChatView({ friend, onBack }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [viewingSnap, setViewingSnap] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Poll for new messages
    return () => clearInterval(interval);
  }, [friend.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const [received, sent] = await Promise.all([
        snaps.getReceived(),
        snaps.getSent()
      ]);

      const friendMessages = [
        ...received.data.filter(s => s.sender_id === friend.id),
        ...sent.data.filter(s => s.receiver_id === friend.id)
      ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      setMessages(friendMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendText = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      await snaps.send({
        receiverId: friend.id,
        text: messageText.trim()
      });
      setMessageText('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendMedia = async (file, preview, type) => {
    setSending(true);
    setShowCamera(false);

    try {
      // Upload file
      const uploadResponse = await upload.file(file);
      const mediaUrl = uploadResponse.data.url;

      // Send snap with media
      await snaps.send({
        receiverId: friend.id,
        mediaUrl: `http://localhost:3000${mediaUrl}`,
        text: type === 'photo' ? '📸 Photo' : '🎥 Video'
      });

      await loadMessages();
    } catch (error) {
      console.error('Error sending media:', error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSending(true);
    try {
      const uploadResponse = await upload.file(file);
      const mediaUrl = uploadResponse.data.url;
      const type = file.type.startsWith('video') ? 'video' : 'photo';

      await snaps.send({
        receiverId: friend.id,
        mediaUrl: `http://localhost:3000${mediaUrl}`,
        text: type === 'video' ? '🎥 Video' : '📸 Photo'
      });

      await loadMessages();
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSnapClick = async (snap) => {
    if (snap.media_url && snap.sender_id !== user.id && !snap.viewed) {
      // Mark as viewed
      await snaps.markViewed(snap.id);
      await loadMessages();
    }
    if (snap.media_url) {
      setViewingSnap(snap);
    }
  };

  const isMyMessage = (message) => message.sender_id === user.id;

  return (
    <div className="h-full bg-gradient-to-br from-onyx-darker to-onyx-dark flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/5 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-onyx-accent via-onyx-purple to-onyx-cyan flex items-center justify-center text-white font-bold text-lg">
            {friend.username?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1">
            <h2 className="text-white font-bold text-lg">{friend.display_name || friend.username}</h2>
            <p className="text-gray-400 text-sm">@{friend.username}</p>
          </div>

          {friend.streak_count > 0 && (
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
              <span className="text-lg">🔥</span>
              <span className="text-white font-bold">{friend.streak_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-12 h-12 border-4 border-onyx-accent border-t-transparent rounded-full"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 mb-4 bg-gradient-to-br from-onyx-accent to-onyx-purple rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-lg">No messages yet</p>
            <p className="text-gray-500 text-sm mt-2">Send a snap to start the chat!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isMine = isMyMessage(message);
              const showDate = index === 0 ||
                new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();

              return (
                <div key={message.id} className="animate-slide-up">
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="glass px-4 py-1.5 rounded-full text-xs text-white/70">
                        {new Date(message.created_at).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] group ${
                        message.media_url ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => message.media_url && handleSnapClick(message)}
                    >
                      {message.media_url ? (
                        /* Media Snap - Snapchat Style */
                        <div className={`relative rounded-2xl overflow-hidden ${
                          isMine
                            ? 'bg-gradient-to-br from-onyx-accent to-onyx-purple'
                            : 'bg-white/10'
                        }`}>
                          <div className="w-48 h-64 bg-black/20 flex items-center justify-center backdrop-blur-sm">
                            {!message.viewed && !isMine ? (
                              <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <p className="text-white font-semibold text-sm">Tap to view</p>
                                <p className="text-white/60 text-xs mt-1">Hold to keep open</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                                  {message.text?.includes('Video') ? '🎥' : '📸'}
                                </div>
                                <p className="text-white/80 text-xs">{message.text}</p>
                                {isMine && message.viewed && (
                                  <p className="text-white/60 text-xs mt-1">✓ Viewed</p>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="glass px-2 py-1 rounded-lg text-xs text-white/90">
                              {new Date(message.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric', minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Text Message */
                        <div className={`px-4 py-2.5 rounded-2xl ${
                          isMine
                            ? 'bg-gradient-to-br from-onyx-accent to-onyx-purple text-white rounded-br-md'
                            : 'glass text-white rounded-bl-md'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-white/50'}`}>
                            {new Date(message.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="glass border-t border-white/5 p-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {/* Camera Button */}
          <button
            onClick={() => setShowCamera(true)}
            className="p-3 rounded-full bg-gradient-to-br from-onyx-accent to-onyx-purple hover:scale-110 active:scale-95 transition-transform shadow-glow"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Gallery Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full glass hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-onyx-accent/50 focus:border-transparent transition-all"
          />

          {/* Send Button */}
          <button
            onClick={handleSendText}
            disabled={!messageText.trim() || sending}
            className="p-3 rounded-full bg-gradient-to-br from-onyx-purple to-onyx-cyan hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 shadow-glow"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <MediaCapture
          onCapture={handleSendMedia}
          onClose={() => setShowCamera(false)}
          autoOpen={true}
        />
      )}

      {/* Snap Viewer */}
      {viewingSnap && (
        <SnapViewer
          snap={viewingSnap}
          onClose={() => setViewingSnap(null)}
        />
      )}
    </div>
  );
}
