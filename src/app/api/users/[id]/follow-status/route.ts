import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id: targetUserId } = await params;
    
    // Find the current user by their Clerk ID
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Find the target user by their MongoDB ID or Clerk ID
    let targetUser = null;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      targetUser = await User.findById(targetUserId);
    } else {
      targetUser = await User.findOne({ clerkId: targetUserId });
    }
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Check if current user is following the target user
    const isFollowing = currentUser.following.some((id: mongoose.Types.ObjectId) => 
      id.equals(targetUser._id)
    );

    return NextResponse.json({
      success: true,
      isFollowing,
      followersCount: targetUser.followers.length,
      followingCount: targetUser.following.length
    });

  } catch (error: any) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 