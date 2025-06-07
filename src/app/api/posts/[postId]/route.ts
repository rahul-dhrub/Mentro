import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import Hashtag from '@/models/Hashtag';
import mongoose from 'mongoose';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { postId } = await params;
    
    // Validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Find the post
    const post = await Post.findById(postId).populate('hashtags');
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Find the user in our database
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user owns the post
    if (!post.userId.equals(dbUser._id)) {
      return NextResponse.json({ error: 'Not authorized to delete this post' }, { status: 403 });
    }

    // Remove post ID from all associated hashtags
    if (post.hashtags && post.hashtags.length > 0) {
      await Promise.all(
        post.hashtags.map(async (hashtagId: any) => {
          const hashtag = await Hashtag.findById(hashtagId);
          if (hashtag) {
            await hashtag.removePost(post._id);
          }
        })
      );
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    return NextResponse.json({
      message: 'Post deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connectDB();

    const { postId } = await params;
    
    // Validate postId format
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Find the post with populated data
    const post = await Post.findById(postId)
      .populate({
        path: 'userId',
        model: User,
        select: 'name email profilePicture',
      })
      .populate({
        path: 'hashtags',
        model: Hashtag,
        select: 'name followers posts',
      });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Format the response
    const formattedPost = {
      ...post.toObject(),
      author: {
        id: post.userId._id,
        name: post.userId.name,
        email: post.userId.email,
        avatar: post.userId.profilePicture,
      },
      tags: post.hashtags?.map((hashtag: any) => hashtag.name) || [],
      hashtags: post.hashtags || []
    };

    return NextResponse.json({ post: formattedPost });

  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 