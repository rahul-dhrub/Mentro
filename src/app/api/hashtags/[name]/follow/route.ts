import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Hashtag from '@/models/Hashtag';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name } = await params;
    const hashtagName = decodeURIComponent(name);
    const normalizedName = hashtagName.toLowerCase().startsWith('#') 
      ? hashtagName.toLowerCase() 
      : `#${hashtagName.toLowerCase()}`;

    // Find the hashtag
    const hashtag = await Hashtag.findOne({ name: normalizedName });
    if (!hashtag) {
      return NextResponse.json({ 
        isFollowing: false,
        followersCount: 0
      });
    }

    // Find the user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ 
        isFollowing: false,
        followersCount: hashtag.followers
      });
    }

    // Check if user is following the hashtag
    const isFollowing = user.followedHashtags?.includes(hashtag._id) || false;

    return NextResponse.json({
      isFollowing,
      followersCount: hashtag.followers
    });

  } catch (error: any) {
    console.error('Error checking hashtag follow status:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { name } = await params;
    const hashtagName = decodeURIComponent(name);
    const normalizedName = hashtagName.toLowerCase().startsWith('#') 
      ? hashtagName.toLowerCase() 
      : `#${hashtagName.toLowerCase()}`;

    // Find the hashtag
    const hashtag = await Hashtag.findOne({ name: normalizedName });
    if (!hashtag) {
      return NextResponse.json({ error: 'Hashtag not found' }, { status: 404 });
    }

    // Find the user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already following the hashtag
    const isFollowing = user.followedHashtags?.includes(hashtag._id) || false;

    if (isFollowing) {
      // Unfollow: Remove hashtag from user's followed list and decrement follower count
      await User.findByIdAndUpdate(user._id, {
        $pull: { followedHashtags: hashtag._id }
      });
      await hashtag.decrementFollowers();
      
      return NextResponse.json({
        message: 'Hashtag unfollowed successfully',
        isFollowing: false,
        followersCount: hashtag.followers
      });
    } else {
      // Follow: Add hashtag to user's followed list and increment follower count
      await User.findByIdAndUpdate(user._id, {
        $addToSet: { followedHashtags: hashtag._id }
      });
      await hashtag.incrementFollowers();
      
      return NextResponse.json({
        message: 'Hashtag followed successfully',
        isFollowing: true,
        followersCount: hashtag.followers
      });
    }
  } catch (error: any) {
    console.error('Error toggling hashtag follow:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 