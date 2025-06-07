import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hashtag from '@/models/Hashtag';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, description, category, createdBy } = body;

    // Check if hashtag already exists
    const existingHashtag = await Hashtag.findOne({ name: name.toLowerCase() });
    if (existingHashtag) {
      return NextResponse.json(
        { error: 'Hashtag already exists' },
        { status: 400 }
      );
    }

    // Create new hashtag
    const hashtag = await Hashtag.create({
      name: name.toLowerCase(),
      description,
      category,
      createdBy,
    });

    return NextResponse.json(
      { message: 'Hashtag created successfully', hashtag },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating hashtag:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = parseInt(searchParams.get('skip') || '0');

    let query: any = { isActive: true };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    const hashtags = await Hashtag.find(query)
      .sort({ posts: -1 }) // Sort by popularity
      .limit(limit)
      .skip(skip)
      .populate('createdBy', 'name email');

    const total = await Hashtag.countDocuments(query);

    return NextResponse.json({
      hashtags,
      pagination: {
        total,
        limit,
        skip,
        hasMore: total > skip + limit
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching hashtags:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 