import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: userId } = await params;
    
    // Find the user by their MongoDB ID or Clerk ID
    let user = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId).populate({
        path: 'followers',
        select: 'name email profilePicture title department bio'
      });
    } else {
      user = await User.findOne({ clerkId: userId }).populate({
        path: 'followers',
        select: 'name email profilePicture title department bio'
      });
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format the followers data
    const followers = user.followers.map((follower: any) => ({
      id: follower._id.toString(),
      name: follower.name,
      email: follower.email,
      avatar: follower.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(follower.name)}&background=0D8ABC&color=fff`,
      title: follower.title,
      department: follower.department,
      bio: follower.bio
    }));

    return NextResponse.json({
      success: true,
      followers,
      count: followers.length
    });

  } catch (error: any) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 