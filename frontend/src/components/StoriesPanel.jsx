import { useState, useEffect } from 'react';
import { stories, upload } from '../api';
import StoryCard from './StoryCard';
import MediaCapture from './MediaCapture';
import CreateStoryModal from './CreateStoryModal';

export default function StoriesPanel() {
  const [storyFeed, setStoryFeed] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadStories();
    // Show tutorial on first visit
    const hasSeenTutorial = localStorage.getItem('onyx-stories-tutorial-seen');
    if (!hasSeenTutorial) {
      setTimeout(() => setShowTutorial(true), 1000);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showCamera || showTextEditor) return; // Don't trigger when modals are open

      switch(e.key) {
        case 'ArrowLeft':
          handleSwipe('left');
          break;
        case 'ArrowRight':
          handleSwipe('right');
          break;
        case 'l':
        case 'L':
          // Like current story
          if (currentIndex < storyFeed.length) {
            handleSwipe('right');
          }
          break;
        case 's':
        case 'S':
          // Skip current story
          if (currentIndex < storyFeed.length) {
            handleSwipe('left');
          }
          break;
        case 'c':
        case 'C':
          setShowCamera(true);
          break;
        case 't':
        case 'T':
          setShowTextEditor(true);
          break;
        case '?':
          setShowTutorial(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, storyFeed, showCamera, showTextEditor]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await stories.getFeed(50);
      setStoryFeed(response.data);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    if (currentIndex >= storyFeed.length) return;

    const currentStory = storyFeed[currentIndex];
    setSwipeDirection(direction);

    try {
      await stories.swipe(currentStory.id, direction);

      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);

        if (currentIndex >= storyFeed.length - 5) {
          loadStories();
        }
      }, 300);
    } catch (error) {
      console.error('Error swiping:', error);
      setSwipeDirection(null);
    }
  };

  const handleMediaCapture = (file, preview, type) => {
    setCapturedMedia({ file, preview, type });
    setShowCamera(false);
    setShowTextEditor(true);
  };

  const currentStory = storyFeed[currentIndex];

  // Render loading state
  const loadingContent = loading && storyFeed.length === 0 && (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-16 h-16 bg-gradient-to-br from-onyx-accent to-onyx-purple rounded-full animate-spin">
          <div className="w-full h-full rounded-full border-4 border-transparent border-t-white"></div>
        </div>
        <p className="text-white text-lg">Loading stories...</p>
      </div>
    </div>
  );

  // Render empty state
  const emptyContent = !loading && storyFeed.length === 0 && (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="glass p-12 rounded-3xl max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-onyx-accent to-onyx-purple rounded-full flex items-center justify-center animate-bounce-subtle">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-white text-3xl font-bold mb-3">No Stories Yet</h2>
        <p className="text-gray-400 mb-6 text-lg">Be the first to share something amazing!</p>
        <button
          onClick={() => setShowCamera(true)}
          className="btn-primary px-8 py-4 bg-gradient-to-r from-onyx-accent to-onyx-purple hover:from-onyx-accent-dark hover:to-purple-600 text-white rounded-xl font-semibold shadow-glow transition-all duration-300"
        >
          Create Your First Story
        </button>
      </div>
    </div>
  );

  // Render caught up state
  const caughtUpContent = !loading && storyFeed.length > 0 && currentIndex >= storyFeed.length && (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="glass p-12 rounded-3xl max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-scale-in">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-white text-3xl font-bold mb-3">All Caught Up!</h2>
        <p className="text-gray-400 mb-6 text-lg">You've seen all the stories for now</p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            loadStories();
          }}
          className="btn-primary px-8 py-4 bg-gradient-to-r from-onyx-purple to-onyx-cyan hover:from-purple-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-glow transition-all duration-300"
        >
          Refresh Feed
        </button>
      </div>
    </div>
  );

  const currentStory = storyFeed[currentIndex];

  return (
    <div className="h-full relative bg-gradient-to-br from-onyx-darker to-onyx-dark overflow-hidden">
      {/* Render appropriate content based on state */}
      {loadingContent}
      {emptyContent}
      {caughtUpContent}

      {/* Show story UI only when we have stories and haven't finished */}
      {!loading && storyFeed.length > 0 && currentIndex < storyFeed.length && (
        <>
          {/* Floating action buttons */}
          <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setShowTutorial(true)}
          className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-glow-lg hover:scale-110 active:scale-95 transition-transform duration-200"
          title="Help & Keyboard Shortcuts (?)"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <button
          onClick={() => setShowTextEditor(true)}
          className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-glow-lg hover:scale-110 active:scale-95 transition-transform duration-200 group"
          title="Create text story (T)"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => setShowCamera(true)}
          className="p-4 bg-gradient-to-br from-onyx-accent to-onyx-purple rounded-full shadow-glow-lg hover:scale-110 active:scale-95 transition-transform duration-200 group animate-bounce-subtle"
          title="Create photo/video story (C)"
        >
          <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute top-4 left-4 right-20 z-20">
        <div className="glass px-4 py-2 rounded-full">
          <div className="flex items-center justify-between text-white text-sm font-medium">
            <span>{currentIndex + 1} of {storyFeed.length}</span>
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden ml-3">
              <div
                className="h-full bg-gradient-to-r from-onyx-accent to-onyx-purple rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / storyFeed.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Card */}
      <div className="h-full flex items-center justify-center p-4 pt-20">
        <StoryCard
          story={currentStory}
          onSwipeLeft={() => handleSwipe('left')}
          onSwipeRight={() => handleSwipe('right')}
          swipeDirection={swipeDirection}
        />
      </div>

      {/* Swipe indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 px-8 pointer-events-none">
        <div className="glass flex items-center gap-3 px-6 py-3 rounded-full animate-slide-up">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span className="text-white font-semibold">Skip</span>
        </div>
        <div className="glass flex items-center gap-3 px-6 py-3 rounded-full animate-slide-up delay-100">
          <span className="text-white font-semibold">Like</span>
          <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Camera for capturing media - Always available */}
      {showCamera && (
        <MediaCapture
          onCapture={handleMediaCapture}
          onClose={() => setShowCamera(false)}
          autoOpen={true}
        />
      )}

      {/* Text overlay editor after capture OR text-only story */}
      {showTextEditor && (
        <CreateStoryModal
          onClose={() => {
            setShowTextEditor(false);
            setCapturedMedia(null);
          }}
          onCreated={() => {
            setShowTextEditor(false);
            setCapturedMedia(null);
            loadStories();
          }}
          initialMedia={capturedMedia}
        />
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in">
          <div className="glass max-w-2xl w-full p-8 rounded-3xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-3xl font-bold">How to Use Stories</h2>
              <button
                onClick={() => {
                  setShowTutorial(false);
                  localStorage.setItem('onyx-stories-tutorial-seen', 'true');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 text-gray-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">👆</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Swipe or Use Arrows</h3>
                  <p>Swipe right or press → to like a story. Swipe left or press ← to skip.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">❤️</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Double-Tap to Like</h3>
                  <p>Double-tap anywhere on a story to quickly like it!</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📸</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Create Stories</h3>
                  <p>Press the camera button (or press C) to create a photo/video story. Press the text button (or press T) for text-only stories.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⌨️</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg mb-1">Keyboard Shortcuts</h3>
                  <div className="space-y-1 mt-2 text-sm">
                    <p><kbd className="px-2 py-1 bg-white/10 rounded">←</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">S</kbd> - Skip</p>
                    <p><kbd className="px-2 py-1 bg-white/10 rounded">→</kbd> or <kbd className="px-2 py-1 bg-white/10 rounded">L</kbd> - Like</p>
                    <p><kbd className="px-2 py-1 bg-white/10 rounded">C</kbd> - Camera | <kbd className="px-2 py-1 bg-white/10 rounded">T</kbd> - Text | <kbd className="px-2 py-1 bg-white/10 rounded">?</kbd> - Help</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowTutorial(false);
                localStorage.setItem('onyx-stories-tutorial-seen', 'true');
              }}
              className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-onyx-accent to-onyx-purple hover:from-onyx-accent-dark hover:to-purple-600 text-white rounded-xl font-semibold shadow-glow transition-all duration-300"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
