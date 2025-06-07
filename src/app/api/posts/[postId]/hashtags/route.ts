import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Hashtag from '@/models/Hashtag';
import mongoose from 'mongoose';

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

    // Find the post with populated hashtags
    const post = await Post.findById(postId)
      .populate({
        path: 'hashtags',
        model: Hashtag,
        select: 'name followers posts category description',
      });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Format hashtags for response
    const hashtags = post.hashtags?.map((hashtag: any) => ({
      id: hashtag._id,
      name: hashtag.name,
      followers: hashtag.followers || 0,
      posts: hashtag.posts || 0,
      category: hashtag.category || 'general',
      description: hashtag.description || ''
    })) || [];

    return NextResponse.json({ hashtags });

  } catch (error: any) {
    console.error('Error fetching post hashtags:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 