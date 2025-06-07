/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get blogs with pagination
 *     description: Retrieve blogs from the database with optional filtering and pagination
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter blogs by specific user ID (MongoDB ObjectId or Clerk ID)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of blogs per page
 *     responses:
 *       200:
 *         description: Successfully retrieved blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import User from '@/models/User';
import Hashtag from '@/models/Hashtag';
import mongoose from 'mongoose';

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
      // Handle both MongoDB ObjectId and Clerk user ID
      // First, try to find the user in the database to get both IDs
      try {
        // Check if userId is a valid MongoDB ObjectId
        const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
        
        let userQuery: any = {};
        if (isValidObjectId) {
          // If it's a valid ObjectId, search by both _id and clerkId
          userQuery = {
            $or: [
              { _id: userId },      // MongoDB ObjectId
              { clerkId: userId }   // Clerk user ID (just in case)
            ]
          };
        } else {
          // If it's not a valid ObjectId, it's likely a Clerk ID
          userQuery = { clerkId: userId };
        }
        
        const user = await User.findOne(userQuery);
        
        if (user) {
          // Search for blogs by both the MongoDB ObjectId and Clerk ID
          query = {
            $or: [
              { 'author.id': user._id.toString() },    // MongoDB ObjectId as string
              { 'author.id': user.clerkId }             // Clerk user ID
            ]
          };
        } else {
          // If user not found, still try to search directly with the provided ID
          query = { 'author.id': userId };
        }
      } catch (error) {
        console.error('Error finding user for blog query:', error);
        // Fallback to direct ID search
        query = { 'author.id': userId };
      }
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

    // Extract hashtags from title and content
    const extractHashtags = (text: string): string[] => {
      const hashtagRegex = /#[\w]+/g;
      return text.match(hashtagRegex) || [];
    };

    const hashtagsFromContent = [
      ...extractHashtags(title),
      ...extractHashtags(content)
    ];

    // Also process tags from the form input as hashtags
    const hashtagsFromTags = tagArray.map(tag => {
      // Ensure tag starts with # for consistency
      return tag.startsWith('#') ? tag : `#${tag}`;
    });

    // Combine all hashtags and remove duplicates
    const allHashtags = [
      ...hashtagsFromContent,
      ...hashtagsFromTags
    ];

    // Remove duplicates and normalize
    const uniqueHashtags = [...new Set(allHashtags.map(tag => tag.toLowerCase()))];

    // Create or find hashtags and get their ObjectIds
    const hashtagIds: mongoose.Types.ObjectId[] = [];
    
    for (const hashtagName of uniqueHashtags) {
      try {
        let hashtag = await Hashtag.findOne({ name: hashtagName });
        
        if (!hashtag) {
          // Create new hashtag
          hashtag = await Hashtag.create({
            name: hashtagName,
            description: `Posts and blogs tagged with ${hashtagName}`,
            category: 'general'
          });
        }
        
        hashtagIds.push(hashtag._id);
      } catch (error) {
        console.error(`Error processing hashtag ${hashtagName}:`, error);
        // Continue with other hashtags even if one fails
      }
    }

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
      hashtags: hashtagIds,
      readTime
    });

    // Add blog ID to each hashtag's blogIds array
    console.log(`Adding blog ${blog._id} to ${hashtagIds.length} hashtags`);
    for (const hashtagId of hashtagIds) {
      try {
        // Try direct database update as a fallback to method-based approach
        const hashtag = await Hashtag.findById(hashtagId);
        if (hashtag) {
          console.log(`Before adding blog - Hashtag: ${hashtag.name}, blog count: ${hashtag.blogs}, blogIds length: ${hashtag.blogIds.length}`);
          
          // Try the instance method first
          try {
            const updatedHashtag = await hashtag.addBlog(blog._id);
            console.log(`After addBlog method - Hashtag: ${updatedHashtag.name}, blog count: ${updatedHashtag.blogs}, blogIds length: ${updatedHashtag.blogIds.length}`);
          } catch (methodError) {
            console.error(`addBlog method failed, trying direct update:`, methodError);
            
            // Fallback: Direct database update
            // First check if the blog ID is already in the array
            const existingHashtag = await Hashtag.findById(hashtagId);
            const blogExists = existingHashtag?.blogIds.some((id: any) => id.equals(blog._id));
            
            if (!blogExists) {
              // Use a more robust approach: first add to set, then sync count
              await Hashtag.findByIdAndUpdate(
                hashtagId,
                { $addToSet: { blogIds: blog._id } }
              );
              
              // Then update the count to match the array length
              const result = await Hashtag.findByIdAndUpdate(
                hashtagId,
                [{ $set: { blogs: { $size: "$blogIds" } } }], // Use aggregation to set count = array size
                { new: true }
              );
              console.log(`After direct update - Hashtag: ${result?.name}, blog count: ${result?.blogs}, blogIds length: ${result?.blogIds.length}`);
            } else {
              console.log(`Blog already exists in hashtag ${existingHashtag?.name}`);
            }
          }
          
          // Final verification
          const verifyHashtag = await Hashtag.findById(hashtagId);
          console.log(`Final verification - Hashtag: ${verifyHashtag?.name}, blog count: ${verifyHashtag?.blogs}, blogIds length: ${verifyHashtag?.blogIds.length}`);
        } else {
          console.log(`Hashtag not found for ID: ${hashtagId}`);
        }
      } catch (error) {
        console.error(`Error adding blog to hashtag ${hashtagId}:`, error);
        // Continue with other hashtags even if one fails
      }
    }

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