import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import User from '@/models/User';

// GET endpoint for fetching blogs
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get query params
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Define query for blogs based on filter
    let query = {};
    if (userId) {
      query = { 'author.id': userId };
    }

    // Fetch blogs from database with pagination
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalBlogs = await Blog.countDocuments(query);

    // Return the blogs with pagination info
    return NextResponse.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalBlogs / limit),
        total: totalBlogs,
        hasMore: skip + blogs.length < totalBlogs
      }
    });
  } catch (error) {
    console.error('Error in blogs API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST endpoint for creating a blog
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Connect to database
    await connectDB();

    // Parse the request body
    const { title, content, coverImage, tags } = await request.json();

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Create excerpt from content (strip markdown and truncate)
    const excerpt = content
      .replace(/[#*[\](!`]/g, '')
      .substring(0, 150) + '...';

    // Calculate read time (rough estimate: 200 words per minute)
    const readTime = Math.max(1, Math.floor(content.split(' ').length / 200));

    // Prepare tag array
    const tagArray = Array.isArray(tags) 
      ? tags 
      : typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

    // Create blog
    const blog = await Blog.create({
      title,
      content,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3',
      excerpt,
      author: {
        id: userId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        avatar: user.imageUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(`${user.firstName} ${user.lastName}`.trim()),
      },
      tags: tagArray,
      readTime
    });

    return NextResponse.json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
} 