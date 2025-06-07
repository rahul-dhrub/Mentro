import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hashtag from '@/models/Hashtag';
import Blog from '@/models/Blog';

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

    // Debug logging
    console.log(`Hashtag found: ${hashtag.name}`);
    console.log(`Blog IDs in hashtag: ${hashtag.blogIds.length}`);
    console.log(`Blog IDs: ${hashtag.blogIds.map((id: any) => id.toString())}`);

    // Get blogs associated with this hashtag using the blogIds array
    const blogs = await Blog.find({ _id: { $in: hashtag.blogIds } })
      .populate({
        path: 'hashtags',
        model: Hashtag,
        select: 'name followers blogs',
      })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit);

    // Format the blogs
    const formattedBlogs = blogs.map(blog => ({
      ...blog.toObject(),
      author: {
        id: blog.author.id,
        name: blog.author.name,
        avatar: blog.author.avatar,
      },
      hashtagNames: blog.hashtags?.map((hashtag: any) => hashtag.name) || []
    }));

    const total = hashtag.blogIds.length;

    // Debug the response data
    console.log(`Response data for ${hashtag.name}:`);
    console.log(`- Found ${formattedBlogs.length} blogs`);
    console.log(`- hashtag.blogs field: ${hashtag.blogs}`);
    console.log(`- hashtag.blogIds.length: ${hashtag.blogIds.length}`);
    console.log(`- calculated total: ${total}`);

    return NextResponse.json({
      blogs: formattedBlogs,
      hashtag: {
        name: hashtag.name,
        description: hashtag.description,
        followers: hashtag.followers,
        posts: hashtag.posts,
        blogs: hashtag.blogs,
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
    console.error('Error fetching hashtag blogs:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 