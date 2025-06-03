# Heartbeat System Documentation

## Overview

The heartbeat system tracks user online status in real-time using Redis for fast caching and MongoDB for persistent storage. Users are automatically tracked as "online", "away", or "offline" based on their activity.

## Features

- **Real-time Status Tracking**: Updates every 5 seconds
- **Smart Status Detection**: 
  - "Online" - Active within 5 seconds
  - "Away" - Active within 1 minute but not in last 5 seconds
  - "Offline" - Not present in Redis cache (TTL expired after 5 minutes)
- **Activity Detection**: Tracks mouse, keyboard, scroll, and touch events
- **Page Visibility Handling**: Automatically goes offline when tab is hidden
- **Graceful Cleanup**: Sends offline signal when user leaves

## Architecture

### Components

1. **Redis Client** (`src/lib/redis.ts`)
   - Manages Redis connection
   - Handles heartbeat operations with 5-minute TTL
   - Provides user status aggregation

2. **Heartbeat API** (`src/app/api/heartbeat/route.ts`)
   - POST: Updates user heartbeat in Redis
   - DELETE: Removes user from Redis (offline)

3. **Admin API** (`src/app/api/admin/online-users/route.ts`)
   - Fetches all active users for admin portal
   - Returns formatted status data

4. **React Hook** (`src/hooks/useHeartbeat.ts`)
   - Client-side heartbeat management
   - Activity tracking and status updates
   - Automatic cleanup on unmount

5. **Admin Component** (`src/app/admin/components/OnlineUsersList.tsx`)
   - Real-time display of online users
   - Status indicators and auto-refresh

## Setup

### 1. Install Dependencies

```bash
npm install redis @types/redis
```

### 2. Environment Variables

Add to your `.env.local`:

```env
REDIS_URL=redis://localhost:6379
```

### 3. Redis Setup

**Local Development:**
```bash
# Install Redis
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Ubuntu

# Start Redis
redis-server
```

**Production:**
Use a managed Redis service like:
- Redis Cloud
- AWS ElastiCache
- Google Cloud Memorystore
- Azure Cache for Redis

## Usage

### Automatic Integration

The heartbeat system is automatically enabled for all authenticated users through the `OnlineStatusProvider` in the main layout.

### Manual Control

```typescript
import { useHeartbeat } from '@/hooks/useHeartbeat';

function MyComponent() {
  const { sendHeartbeat, sendOfflineSignal } = useHeartbeat(true);
  
  // Manual heartbeat
  const handleActivity = () => {
    sendHeartbeat();
  };
  
  // Manual offline
  const handleLogout = () => {
    sendOfflineSignal();
  };
}
```

### Admin Portal

Access the online users list at `/admin` → "Online Users" tab.

## API Endpoints

### POST /api/heartbeat
Updates user's online status in Redis.

**Response:**
```json
{
  "success": true,
  "message": "Heartbeat updated",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### DELETE /api/heartbeat
Marks user as offline.

### GET /api/admin/online-users
Returns all active users (admin only).

**Response:**
```json
{
  "users": [
    {
      "userId": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "department": "Computer Science",
      "status": "online",
      "lastSeen": "2024-01-01T12:00:00.000Z",
      "lastSeenMs": 1000,
      "lastActiveFormatted": "Just now"
    }
  ],
  "total": 1,
  "onlineCount": 1,
  "awayCount": 0,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Status Logic

```typescript
const timeDiff = now - userData.lastSeen;

if (timeDiff <= 5000) {
  status = 'online';    // Active within 5 seconds
} else if (timeDiff <= 60000) {
  status = 'away';      // Active within 1 minute
} else {
  status = 'offline';   // TTL expired or inactive
}
```

## Performance Considerations

- **Redis TTL**: 5 minutes prevents memory bloat
- **Heartbeat Interval**: 5 seconds balances real-time updates with server load
- **Activity Throttling**: Only sends heartbeat when user is active
- **Batch Operations**: Uses Redis pipeline for efficient multi-user queries

## Monitoring

Monitor Redis performance and connection health:

```bash
# Redis CLI
redis-cli info memory
redis-cli info clients
redis-cli keys "heartbeat:*" | wc -l  # Count active users
```

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server is running
   - Verify REDIS_URL environment variable
   - Check network connectivity

2. **Users Not Showing Online**
   - Verify heartbeat hook is enabled
   - Check browser console for errors
   - Confirm user authentication

3. **High Redis Memory Usage**
   - Monitor TTL settings
   - Check for memory leaks
   - Consider Redis memory policies

### Debug Mode

Enable debug logging:

```typescript
// In redis.ts
console.log('Setting heartbeat for user:', userId);
console.log('Active users count:', activeUsers.length);
```

## Security

- All endpoints require authentication
- Admin endpoints verify admin role
- Redis keys are namespaced (`heartbeat:userId`)
- No sensitive data stored in Redis
- Automatic cleanup prevents data persistence 