import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(
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
    
    // Find the current user (follower) by their Clerk ID
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Find the target user (to be followed) by their MongoDB ID or Clerk ID
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

    // Check if users are the same
    if (currentUser._id.equals(targetUser._id)) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const isAlreadyFollowing = currentUser.following.some((id: mongoose.Types.ObjectId) => 
      id.equals(targetUser._id)
    );

    if (isAlreadyFollowing) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Add follow relationship
    await currentUser.followUser(targetUser._id);
    await targetUser.addFollower(currentUser._id);

    // Return updated counts
    const updatedTargetUser = await User.findById(targetUser._id);
    
    return NextResponse.json({
      success: true,
      message: `Successfully followed ${targetUser.name}`,
      followersCount: updatedTargetUser.followers.length,
      followingCount: currentUser.following.length,
      isFollowing: true
    });

  } catch (error: any) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Find the current user (follower) by their Clerk ID
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Find the target user (to be unfollowed) by their MongoDB ID or Clerk ID
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

    // Check if currently following
    const isCurrentlyFollowing = currentUser.following.some((id: mongoose.Types.ObjectId) => 
      id.equals(targetUser._id)
    );

    if (!isCurrentlyFollowing) {
      return NextResponse.json(
        { error: 'Not currently following this user' },
        { status: 400 }
      );
    }

    // Remove follow relationship
    await currentUser.unfollowUser(targetUser._id);
    await targetUser.removeFollower(currentUser._id);

    // Return updated counts
    const updatedTargetUser = await User.findById(targetUser._id);
    
    return NextResponse.json({
      success: true,
      message: `Successfully unfollowed ${targetUser.name}`,
      followersCount: updatedTargetUser.followers.length,
      followingCount: currentUser.following.length,
      isFollowing: false
    });

  } catch (error: any) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 