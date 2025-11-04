# Onyx Frontend

React-based frontend for the Onyx social media application.

## Features

- **Three-panel navigation**: Snaps, Stories, Settings
- **Swipe gestures**: Touch and mouse support for story swiping
- **Real-time updates**: Dynamic content loading
- **Responsive design**: Mobile-first approach
- **Dark theme**: Modern, sleek interface

## Components

### Pages
- `Login` - User login page
- `Register` - User registration page
- `Home` - Main app with three-panel layout

### Panels
- `SnapsPanel` - Friends list, received/sent snaps, streaks
- `StoriesPanel` - Story feed with swipe functionality
- `SettingsPanel` - User profile and settings

### Components
- `StoryCard` - Swipeable story card with gesture support
- `CreateStoryModal` - Modal for creating new stories
- `SendSnapModal` - Modal for sending snaps to friends
- `AddFriendModal` - Modal for searching and adding friends

## State Management

- **AuthContext**: Global authentication state
- **Local state**: Component-level state with React hooks

## API Integration

All API calls are centralized in `src/api/`:
- `client.js` - Axios instance with interceptors
- `index.js` - API method definitions

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom animations**: Swipe animations and transitions
- **Color palette**:
  - Dark: `#0a0a0a`
  - Gray: `#1a1a1a`
  - Accent: `#ff006e`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output will be in the `dist` directory.
