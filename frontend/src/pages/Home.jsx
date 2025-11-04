import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SnapsPanel from '../components/SnapsPanel';
import StoriesPanel from '../components/StoriesPanel';
import SettingsPanel from '../components/SettingsPanel';

export default function Home() {
  const [activePanel, setActivePanel] = useState('stories');
  const { user } = useAuth();

  return (
    <div className="h-screen bg-gradient-to-br from-onyx-darker via-onyx-dark to-onyx-gray flex flex-col overflow-hidden">
      {/* Top Header - Snapchat style */}
      <div className="glass border-b border-onyx-light/30 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Avatar/Settings */}
          <button
            onClick={() => setActivePanel('settings')}
            className="flex items-center gap-2 group"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all duration-300 ${
              activePanel === 'settings'
                ? 'bg-gradient-to-br from-onyx-accent to-onyx-purple shadow-glow ring-2 ring-white/20'
                : 'bg-gradient-to-br from-onyx-light to-onyx-lighter group-hover:from-onyx-accent/50 group-hover:to-onyx-purple/50'
            }`}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </button>

          {/* Center - Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-black gradient-text tracking-tight">ONYX</h1>
          </div>

          {/* Right - Camera/Create */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePanel('stories')}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                activePanel === 'stories'
                  ? 'bg-gradient-to-br from-onyx-accent to-onyx-purple shadow-glow'
                  : 'bg-onyx-light hover:bg-onyx-lighter'
              }`}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-around pb-2 px-4">
          <button
            onClick={() => setActivePanel('snaps')}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-full transition-all duration-300 ${
              activePanel === 'snaps'
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
          >
            <svg className={`w-6 h-6 transition-all duration-300 ${
              activePanel === 'snaps' ? 'text-white scale-110' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className={`text-xs font-semibold transition-all duration-300 ${
              activePanel === 'snaps' ? 'text-white' : 'text-gray-400'
            }`}>Chat</span>
          </button>

          <button
            onClick={() => setActivePanel('stories')}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-full transition-all duration-300 ${
              activePanel === 'stories'
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
          >
            <svg className={`w-6 h-6 transition-all duration-300 ${
              activePanel === 'stories' ? 'text-white scale-110' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className={`text-xs font-semibold transition-all duration-300 ${
              activePanel === 'stories' ? 'text-white' : 'text-gray-400'
            }`}>Stories</span>
          </button>

          <button
            onClick={() => setActivePanel('settings')}
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-full transition-all duration-300 ${
              activePanel === 'settings'
                ? 'bg-white/10'
                : 'hover:bg-white/5'
            }`}
          >
            <svg className={`w-6 h-6 transition-all duration-300 ${
              activePanel === 'settings' ? 'text-white scale-110' : 'text-gray-400'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className={`text-xs font-semibold transition-all duration-300 ${
              activePanel === 'settings' ? 'text-white' : 'text-gray-400'
            }`}>Profile</span>
          </button>
        </div>
      </div>

      {/* Main content area with slide transitions */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-all duration-500 ease-out ${
          activePanel === 'snaps' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}>
          <SnapsPanel />
        </div>

        <div className={`absolute inset-0 transition-all duration-500 ease-out ${
          activePanel === 'stories' ? 'translate-x-0 opacity-100' : activePanel === 'snaps' ? 'translate-x-full opacity-0 pointer-events-none' : '-translate-x-full opacity-0 pointer-events-none'
        }`}>
          <StoriesPanel />
        </div>

        <div className={`absolute inset-0 transition-all duration-500 ease-out ${
          activePanel === 'settings' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        }`}>
          <SettingsPanel />
        </div>
      </div>
    </div>
  );
}
