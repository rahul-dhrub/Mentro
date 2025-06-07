import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hashtag from '@/models/Hashtag';
import Post from '@/models/Post';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

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

    // Get posts associated with this hashtag using the postIds array
    const posts = await Post.find({ _id: { $in: hashtag.postIds } })
      .populate({
        path: 'userId',
        model: User,
        select: 'name email profilePicture',
      })
      .populate({
        path: 'hashtags',
        model: Hashtag,
        select: 'name followers posts',
      })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    // Format the posts
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      author: {
        id: post.userId._id,
        name: post.userId.name,
        email: post.userId.email,
        avatar: post.userId.profilePicture,
      },
      tags: post.hashtags?.map((hashtag: any) => hashtag.name) || []
    }));

    const total = hashtag.postIds.length;

    return NextResponse.json({
      posts: formattedPosts,
      hashtag: {
        name: hashtag.name,
        description: hashtag.description,
        followers: hashtag.followers,
        posts: hashtag.posts,
        category: hashtag.category
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasMore: total > skip + limit
      }
    });

  } catch (error: any) {
    console.error('Error fetching hashtag posts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 