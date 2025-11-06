import { useState, useEffect, useRef } from 'react';
import { stories } from '../api';

export default function StoryCard({ story, onSwipeLeft, onSwipeRight, swipeDirection }) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(story.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const cardRef = useRef(null);

  const minSwipeDistance = 50;
  const isVideo = story.media_url && (story.media_url.includes('.mp4') || story.media_url.includes('.mov') || story.media_url.includes('.webm'));

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart) {
      setDragOffset(e.targetTouches[0].clientX - touchStart);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onSwipeLeft();
    } else if (isRightSwipe) {
      onSwipeRight();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  const onMouseDown = (e) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
    setIsDragging(true);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
    if (touchStart) {
      setDragOffset(e.clientX - touchStart);
    }
  };

  const onMouseUp = () => {
    if (!isDragging) return;
    onTouchEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    }
  }, [isDragging, touchStart]);

  useEffect(() => {
    // Check if user has liked this story
    const checkLikeStatus = async () => {
      try {
        const response = await stories.checkLiked(story.id);
        setLiked(response.data.liked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    checkLikeStatus();
  }, [story.id]);

  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    try {
      if (liked) {
        const response = await stories.unlike(story.id);
        setLiked(false);
        setLikesCount(response.data.likes_count);
      } else {
        const response = await stories.like(story.id);
        setLiked(true);
        setLikesCount(response.data.likes_count);
        // Show heart animation
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 1000);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Double-tap to like
  const handleDoubleTap = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      if (!liked) {
        handleLike();
      }
    }
    setLastTap(currentTime);
  };

  const rotation = dragOffset / 20;
  const opacity = 1 - Math.abs(dragOffset) / 300;

  let textOverlay = null;
  if (story.text_overlay) {
    try {
      textOverlay = typeof story.text_overlay === 'string'
        ? JSON.parse(story.text_overlay)
        : story.text_overlay;
    } catch (e) {
      console.error('Error parsing text overlay:', e);
    }
  }

  return (
    <div
      ref={cardRef}
      className={`w-full max-w-md h-[650px] rounded-3xl shadow-2xl overflow-hidden select-none cursor-grab active:cursor-grabbing transition-all duration-300 animate-scale-in ${
        swipeDirection === 'left' ? 'swipe-left' : swipeDirection === 'right' ? 'swipe-right' : ''
      }`}
      style={{
        transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
        opacity: isDragging ? opacity : 1,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px -15px rgba(255, 0, 128, 0.3)'
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onClick={handleDoubleTap}
    >
      {/* Story Content */}
      <div className="h-full flex flex-col relative">
        {/* Gradient overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none z-10"></div>

        {/* User info */}
        <div className="absolute top-0 left-0 right-0 z-20 p-5">
          <div className="glass px-4 py-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-onyx-accent to-onyx-purple flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/20">
                {story.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="text-white font-bold text-base">{story.display_name || story.username}</div>
                <div className="text-gray-300 text-xs">@{story.username}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/70">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(story.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Media Content with Text Overlay */}
        <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-onyx-darker to-black">
          {story.media_url ? (
            <>
              {isVideo ? (
                <video
                  src={story.media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={story.media_url}
                  alt="Story"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Text Overlay */}
              {textOverlay && textOverlay.text && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${textOverlay.position?.x || 50}%`,
                    top: `${textOverlay.position?.y || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    color: textOverlay.color || '#ffffff',
                    fontSize: `${textOverlay.fontSize || 24}px`,
                    fontWeight: 'bold',
                    textShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.6)',
                    padding: '12px',
                    whiteSpace: 'pre-wrap',
                    textAlign: 'center',
                    maxWidth: '85%',
                    pointerEvents: 'none',
                    letterSpacing: '0.5px',
                    lineHeight: '1.4'
                  }}
                >
                  {textOverlay.text}
                </div>
              )}
            </>
          ) : (
            <div className="text-white text-2xl font-bold text-center leading-relaxed p-10">
              {story.text}
            </div>
          )}
        </div>

        {/* TikTok-style Right Side Actions */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4">
          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 ${
                liked
                  ? 'bg-pink-500/90 scale-110 shadow-[0_0_20px_rgba(236,72,153,0.6)]'
                  : 'bg-white/20 hover:bg-white/30 hover:scale-110'
              }`}
            >
              <svg
                className={`w-7 h-7 transition-all ${liked ? 'text-white' : 'text-white/90'}`}
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={liked ? 0 : 2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <span className="text-white text-xs font-bold drop-shadow-lg">
              {likesCount >= 1000000 ? `${(likesCount / 1000000).toFixed(1)}M` :
               likesCount >= 1000 ? `${(likesCount / 1000).toFixed(1)}K` :
               likesCount}
            </span>
            {story.is_permanent && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 rounded-full">
                <span className="text-xs font-bold text-white">⭐ VIRAL</span>
              </div>
            )}
          </div>

          {/* View count */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-white text-xs font-bold drop-shadow-lg">
              {story.view_count >= 1000 ? `${(story.view_count / 1000).toFixed(1)}K` : story.view_count || 0}
            </span>
          </div>
        </div>

        {/* Tags and Info */}
        <div className="absolute bottom-0 left-0 right-20 z-20 p-5 space-y-3">
          {/* Tags */}
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.tags.slice(0, 5).map((tag, index) => (
                <span
                  key={index}
                  className="glass px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-md animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Swipe direction indicator */}
      {isDragging && Math.abs(dragOffset) > minSwipeDistance && (
        <div className={`absolute top-1/2 ${dragOffset > 0 ? 'right-8' : 'left-8'} transform -translate-y-1/2 z-30`}>
          <div className={`flex items-center justify-center w-20 h-20 rounded-full ${
            dragOffset > 0 ? 'bg-pink-500/30' : 'bg-red-500/30'
          } backdrop-blur-sm animate-pulse`}>
            <div className="text-6xl animate-bounce-subtle">
              {dragOffset > 0 ? '❤️' : '👎'}
            </div>
          </div>
        </div>
      )}

      {/* Double-tap heart animation */}
      {showHeartAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-9xl animate-ping-once opacity-0">
            ❤️
          </div>
        </div>
      )}
    </div>
  );
}
