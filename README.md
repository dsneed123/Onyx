# ONYX - Social Media App

A modern social media application inspired by Snapchat, featuring snaps, stories, streaks, and an intelligent recommendation system.

## Features

### 🔥 Core Features
- **Snaps**: Send ephemeral messages to friends (24-hour expiration)
- **Stories**: Create and share stories with text content
- **Streaks**: Track daily snap exchanges with friends
- **Swipe-Based Discovery**: Swipe left/right on stories to discover content
- **Smart Recommendations**: AI-powered content recommendation based on user interests
- **Auto-Tagging**: Automatic tag extraction from text using NLP and emoji analysis
- **Friend System**: Add friends and manage connections

### 🎨 User Interface
- **Three-Panel Layout**:
  - Left: Snaps & Friends with streaks
  - Middle: Stories feed with swipe functionality
  - Right: Settings & profile management
- **Mobile-First Design**: Touch-optimized swipe gestures
- **Dark Theme**: Sleek dark interface with accent colors

### 🧠 Smart Features
- **Tag Extraction**: Automatically extracts tags from:
  - Hashtags (#trending)
  - Emojis (🔥 → trending, ❤️ → love)
  - Keywords (workout → fitness)
  - Topic detection (gaming, travel, food, etc.)
- **Recommendation Algorithm**: Learns from your swipes to show relevant content
- **Interest Tracking**: Builds user interest profile based on engagement

## Tech Stack

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **bcrypt** for password hashing

### Frontend
- **React** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

## Setup Instructions

### Quick Deployment to Render.com

For production deployment, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for step-by-step instructions to deploy to Render.com (free tier available).

### Local Development Setup

#### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd onyx/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

4. Set up the database:
```bash
npm run db:setup
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd onyx/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Register an account**: Create a new account with username, email, and password
2. **Add friends**: Search for users and add them as friends
3. **Send snaps**: Click on a friend to send them a snap
4. **Create stories**: Tap the + button in the Stories panel to create a story
5. **Swipe stories**: Swipe left to skip, right to like stories in your feed
6. **Track streaks**: Keep your streaks alive by sending daily snaps to friends

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/:id` - Get user by ID

### Friends
- `GET /api/friends` - Get friends list with streaks
- `POST /api/friends` - Add friend
- `DELETE /api/friends/:friendId` - Remove friend
- `GET /api/friends/search?query=username` - Search users

### Snaps
- `POST /api/snaps` - Send snap to friend
- `GET /api/snaps/received` - Get received snaps
- `GET /api/snaps/sent` - Get sent snaps
- `POST /api/snaps/:id/view` - Mark snap as viewed

### Stories
- `POST /api/stories` - Create story
- `GET /api/stories/feed` - Get recommended stories feed
- `GET /api/stories/my-stories` - Get user's own stories
- `POST /api/stories/:id/swipe` - Swipe on story (left/right)
- `DELETE /api/stories/:id` - Delete story

## Database Schema

### Users
- Basic user information (username, email, password, etc.)

### Friendships
- Bidirectional friend relationships

### Streaks
- Track consecutive days of snap exchanges

### Snaps
- Ephemeral messages between friends

### Stories
- User-created content with 24-hour expiration

### Tags
- Extracted tags for content categorization

### Swipes
- User engagement tracking (left/right swipes)

### User Interests
- Calculated interest scores based on swipe behavior

## Recommendation Algorithm

The app uses a collaborative filtering approach:

1. **Tag Extraction**: Text is analyzed to extract relevant tags
2. **Swipe Tracking**: Left/right swipes are recorded
3. **Interest Scoring**: User interests are calculated based on swipes
   - Right swipe (like): +1.0 to tag score
   - Left swipe (skip): -0.5 to tag score
4. **Content Ranking**: Stories are ranked by relevance score
5. **Personalized Feed**: Users see content matching their interests

## Future Enhancements

- [ ] Image/video upload for snaps and stories
- [ ] Filters and AR effects
- [ ] Real-time notifications using WebSockets
- [ ] Group chats
- [ ] Story replies
- [ ] Discover page with trending content
- [ ] Push notifications
- [ ] Mobile apps (iOS/Android)

## License

MIT License

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.
