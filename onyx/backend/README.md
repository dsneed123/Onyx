# Onyx Backend

Backend API for Onyx social media app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

3. Set up the database:
```bash
npm run db:setup
```

4. Start the server:
```bash
npm run dev
```

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

## Features

- JWT authentication
- Friend system with streaks
- Story recommendation algorithm based on user interests
- Automatic tag extraction from text
- Swipe-based engagement tracking
