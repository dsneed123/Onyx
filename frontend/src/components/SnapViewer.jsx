import { useState, useEffect, useRef } from 'react';

export default function SnapViewer({ snap, onClose }) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const HOLD_DURATION = snap.media_url?.includes('video') ? 10000 : 5000; // 10s for video, 5s for image

  useEffect(() => {
    // Start auto-close timer when component mounts
    startAutoClose();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startAutoClose = () => {
    startTimeRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const percentage = (elapsed / HOLD_DURATION) * 100;

      setProgress(percentage);

      if (percentage >= 100) {
        clearInterval(timerRef.current);
        onClose();
      }
    }, 50);
  };

  const handleHoldStart = (e) => {
    e.preventDefault();
    setIsHolding(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleHoldEnd = (e) => {
    e.preventDefault();
    setIsHolding(false);
    startAutoClose();
  };

  // Touch/Mouse drag handlers for swipe down to close
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = currentY - startY;

    // If swiped down more than 100px, close
    if (diff > 100) {
      onClose();
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const handleMouseDown = (e) => {
    setStartY(e.clientY);
    setCurrentY(e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCurrentY(e.clientY);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const diff = currentY - startY;

    if (diff > 100) {
      onClose();
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
  };

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;
  const opacity = isDragging ? Math.max(0.3, 1 - (translateY / 300)) : 1;

  const isVideo = snap.media_url?.includes('video') || snap.media_url?.match(/\.(mp4|mov|avi|webm)$/i);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseDown={handleHoldStart}
      onMouseUp={handleHoldEnd}
      onTouchStart={handleHoldStart}
      onTouchEnd={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
        <div
          className="h-full bg-white transition-all duration-50"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Header - Sender Info */}
      <div className="absolute top-4 left-0 right-0 px-4 z-10 animate-fade-in">
        <div className="glass px-4 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-onyx-accent via-onyx-purple to-onyx-cyan flex items-center justify-center text-white font-bold">
            {snap.sender_username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">
              {snap.sender_username || 'User'}
            </p>
            <p className="text-white/60 text-xs">
              {new Date(snap.created_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Media Content */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-all duration-200"
        style={{
          transform: `translateY(${translateY}px)`,
          opacity: opacity
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {isVideo ? (
          <video
            src={snap.media_url}
            autoPlay
            loop
            className="max-w-full max-h-full object-contain"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            src={snap.media_url}
            alt="Snap"
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        )}
      </div>

      {/* Bottom Instructions */}
      <div className="absolute bottom-8 left-0 right-0 px-4 z-10 animate-fade-in">
        <div className="glass px-6 py-3 rounded-full text-center">
          <p className="text-white/80 text-sm">
            {isHolding ? '👆 Keep holding to view' : '👆 Hold to keep open • Swipe down to close'}
          </p>
        </div>
      </div>
    </div>
  );
}
