import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';

// GET endpoint for fetching a specific blog
export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string; blog_id: string } }
) {
  try {
    const { user_id, blog_id } = params;

    // Connect to database
    await connectDB();

    // Find blog by ID
    const blog = await Blog.findById(blog_id);

    // If blog not found or doesn't belong to the specified user
    if (!blog || blog.author.id !== user_id) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Return blog
    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating a blog
export async function PUT(
  request: NextRequest,
  { params }: { params: { user_id: string; blog_id: string } }
) {
  try {
    const { user_id, blog_id } = params;
    
    // Parse the request body
    const { title, content, coverImage, tags } = await request.json();

    // Connect to database
    await connectDB();

    // Find blog by ID
    const blog = await Blog.findById(blog_id);

    // If blog not found or doesn't belong to the specified user
    if (!blog || blog.author.id !== user_id) {
      return NextResponse.json(
        { error: 'Blog not found or unauthorized' },
        { status: 404 }
      );
    }

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
        : blog.tags;

    // Update blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      blog_id,
      {
        title,
        content,
        coverImage: coverImage || blog.coverImage,
        excerpt,
        tags: tagArray,
        readTime
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE endpoint for deleting a blog
export async function DELETE(
  request: NextRequest,
  { params }: { params: { user_id: string; blog_id: string } }
) {
  try {
    const { user_id, blog_id } = params;

    // Connect to database
    await connectDB();

    // Find blog by ID
    const blog = await Blog.findById(blog_id);

    // If blog not found or doesn't belong to the specified user
    if (!blog || blog.author.id !== user_id) {
      return NextResponse.json(
        { error: 'Blog not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete blog
    await Blog.findByIdAndDelete(blog_id);

    return NextResponse.json({
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
} 