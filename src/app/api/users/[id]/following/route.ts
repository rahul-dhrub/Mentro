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
        path: 'following',
        select: 'name email profilePicture title department bio'
      });
    } else {
      user = await User.findOne({ clerkId: userId }).populate({
        path: 'following',
        select: 'name email profilePicture title department bio'
      });
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Format the following data
    const following = user.following.map((followedUser: any) => ({
      id: followedUser._id.toString(),
      name: followedUser.name,
      email: followedUser.email,
      avatar: followedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(followedUser.name)}&background=0D8ABC&color=fff`,
      title: followedUser.title,
      department: followedUser.department,
      bio: followedUser.bio
    }));

    return NextResponse.json({
      success: true,
      following,
      count: following.length
    });

  } catch (error: any) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 