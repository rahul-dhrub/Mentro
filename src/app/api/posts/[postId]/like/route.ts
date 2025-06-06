import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { postId } = await params;

    // Check if postId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      );
    }

    const post = await Post.findById(new mongoose.Types.ObjectId(postId));
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userObjectId = dbUser._id;
    const isAlreadyLiked = post.likedBy.includes(userObjectId);

    if (isAlreadyLiked) {
      // Unlike the post
      post.likedBy = post.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userObjectId));
    } else {
      // Like the post
      post.likedBy.push(userObjectId);
    }

    await post.save();

    return NextResponse.json({
      success: true,
      liked: !isAlreadyLiked,
      likesCount: post.likedBy.length
    });
  } catch (error) {
    console.error('Error toggling post like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
} 