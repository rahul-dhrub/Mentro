import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hashtag from '@/models/Hashtag';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query.trim()) {
      return NextResponse.json({ hashtags: [] }, { status: 200 });
    }

    // Search for hashtags that match the query
    const hashtags = await Hashtag.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .sort({ followers: -1, posts: -1 }) // Sort by followers first, then posts
    .limit(limit)
    .select('name followers posts description');

    // Format response for frontend
    const formattedHashtags = hashtags.map(hashtag => ({
      name: hashtag.name.startsWith('#') ? hashtag.name : `#${hashtag.name}`,
      followerCount: hashtag.followers || 0,
      postCount: hashtag.posts || 0,
      description: hashtag.description
    }));

    return NextResponse.json({
      hashtags: formattedHashtags
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error searching hashtags:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 