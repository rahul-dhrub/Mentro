import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getAllActiveUsers } from '@/lib/redis';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Helper function to check if user is admin
async function isAdmin() {
  try {
    const user = await currentUser();
    if (!user) return false;
    
    await connectDB();
    const dbUser = await User.findOne({ clerkId: user.id });
    return dbUser?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all active users from Redis
    const activeUsers = await getAllActiveUsers();
    
    // Sort by status and last seen
    const sortedUsers = activeUsers.sort((a, b) => {
      // Priority: online > away > offline
      const statusPriority = { online: 3, away: 2, offline: 1 };
      const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 0;
      const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // If same status, sort by most recent activity
      return a.lastSeenMs - b.lastSeenMs;
    });

    // Add formatted timestamps
    const usersWithTimestamps = sortedUsers.map(user => ({
      ...user,
      lastActiveFormatted: formatLastActive(user.lastSeenMs),
      lastSeen: new Date(user.lastSeen).toISOString()
    }));

    return NextResponse.json({
      users: usersWithTimestamps,
      total: usersWithTimestamps.length,
      onlineCount: usersWithTimestamps.filter(u => u.status === 'online').length,
      awayCount: usersWithTimestamps.filter(u => u.status === 'away').length,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching online users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatLastActive(lastSeenMs: number): string {
  const seconds = Math.floor(lastSeenMs / 1000);
  
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
} 