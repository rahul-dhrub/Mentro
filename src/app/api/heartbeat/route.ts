import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { setUserHeartbeat, removeUserHeartbeat } from '@/lib/redis';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database to get user info
    await connectDB();
    const dbUser = await User.findOne({ clerkId: user.id }).select('-clerkId');
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare user data for Redis
    const userData = {
      userId: dbUser._id.toString(),
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      department: dbUser.department || 'N/A',
    };

    // Update heartbeat in Redis
    const success = await setUserHeartbeat(dbUser._id.toString(), userData);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 });
    }

    // Also update MongoDB lastActive field (less frequently to reduce DB load)
    await User.findByIdAndUpdate(dbUser._id, { 
      lastActive: new Date(),
      isOnline: true
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Heartbeat updated',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Heartbeat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database to get user info
    await connectDB();
    const dbUser = await User.findOne({ clerkId: user.id });
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove heartbeat from Redis
    await removeUserHeartbeat(dbUser._id.toString());
    
    // Update MongoDB to mark user as offline
    await User.findByIdAndUpdate(dbUser._id, { 
      isOnline: false,
      lastActive: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User marked as offline' 
    });

  } catch (error: any) {
    console.error('Error removing heartbeat:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 