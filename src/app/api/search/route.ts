import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Hashtag from '@/models/Hashtag';
import SearchHistory from '@/models/SearchHistory';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'user', 'hashtag', or 'all'
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const searchQuery = query.trim();
    const results: any[] = [];

    // Search users if type is 'user' or 'all'
    if (type === 'user' || type === 'all' || !type) {
      const userQuery = {
        $and: [
          {
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { title: { $regex: searchQuery, $options: 'i' } },
              { department: { $regex: searchQuery, $options: 'i' } },
              { email: { $regex: searchQuery, $options: 'i' } },
              { bio: { $regex: searchQuery, $options: 'i' } }
            ]
          }
        ]
      };

      const users = await User.find(userQuery)
        .select('name email profilePicture title department averageRating totalReviews')
        .limit(type === 'user' ? limit : Math.ceil(limit / 2))
        .lean();

      const userResults = users.map((user: any) => ({
        type: 'user',
        id: user._id.toString(),
        name: user.name,
        avatar: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`,
        title: user.title,
        department: user.department,
        email: user.email,
        followers: Math.floor(Math.random() * 1000) + 50, // Mock followers for now
        posts: Math.floor(Math.random() * 50) + 5, // Mock posts for now
        rating: user.averageRating || 0,
        reviews: user.totalReviews || 0
      }));

      results.push(...userResults);
    }

    // Search hashtags if type is 'hashtag' or 'all'
    if (type === 'hashtag' || type === 'all' || !type) {
      const hashtagQuery = {
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { description: { $regex: searchQuery, $options: 'i' } }
            ]
          }
        ]
      };

      const hashtags = await Hashtag.find(hashtagQuery)
        .sort({ posts: -1 })
        .limit(type === 'hashtag' ? limit : Math.ceil(limit / 2))
        .lean();

      const hashtagResults = hashtags.map((hashtag: any) => ({
        type: 'hashtag',
        id: hashtag._id.toString(),
        name: hashtag.name,
        description: hashtag.description,
        posts: hashtag.posts,
        category: hashtag.category
      }));

      results.push(...hashtagResults);
    }

    // Track search query in history if userId is provided and valid
    if (userId && userId !== 'current_user_id' && results.length > 0) {
      try {
        // Validate that userId is a valid ObjectId format
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
          await SearchHistory.create({
            userId,
            query: searchQuery,
            resultType: results[0].type,
            resultId: results[0].id,
            resultName: results[0].name,
            clicked: false
          });
        }
      } catch (historyError) {
        console.warn('Failed to save search history:', historyError);
        // Don't fail the request if history saving fails
      }
    }

    return NextResponse.json({
      results: results.slice(0, limit),
      total: results.length,
      query: searchQuery
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in search:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { userId, query, resultType, resultId, resultName } = body;

    if (!userId || !query || !resultType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate userId is a valid ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid userId format' },
        { status: 400 }
      );
    }

    // Record that user clicked on a search result
    await SearchHistory.create({
      userId,
      query,
      resultType,
      resultId,
      resultName,
      clicked: true
    });

    return NextResponse.json(
      { message: 'Search interaction recorded' },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error recording search interaction:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 