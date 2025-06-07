/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get posts with pagination
 *     description: Retrieve posts from the database with optional filtering and pagination
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, personal]
 *         description: Filter posts by type (all posts or user's personal posts)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter posts by specific user ID (MongoDB ObjectId or Clerk ID)
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
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: Successfully retrieved posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
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
 *       401:
 *         description: Unauthorized - No valid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new post
 *     description: Create a new post with optional media attachments
 *     tags: [Posts]
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post content
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files to attach
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Video files to attach
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Document files to attach
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No valid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
import Post from '@/models/Post';
import User from '@/models/User';
import Comment from '@/models/Comment';
import Hashtag from '@/models/Hashtag';
import { bunnyClient } from '@/lib/bunny';
import { mockPosts } from '@/app/feed/mockData';
import mongoose from 'mongoose';

// Verify environment variables
const verifyEnvVariables = () => {
  const required = [
    'BUNNY_STORAGE_ZONE',
    'BUNNY_STORAGE_API_KEY',
    'BUNNY_BASE_URL',
    'BUNNY_STREAM_LIBRARY',
    'BUNNY_STREAM_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// GET endpoint for fetching posts
export async function GET(request: NextRequest) {
  try {
    // Get authentication data from Clerk
    const { userId } = await auth();
    
    // Connect to database
    await connectDB();

    // Get query params
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const targetUserId = url.searchParams.get('userId'); // New parameter for specific user posts
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Find the current user in our database (if authenticated)
    let dbUser = null;
    if (userId) {
      dbUser = await User.findOne({ clerkId: userId });
    }

    // Define query for posts based on filter type
    let query = {};
    if (type === 'personal') {
      // For personal posts, only fetch posts by the current user (requires authentication)
      if (!userId) {
        return NextResponse.json({ error: 'Authentication required for personal posts' }, { status: 401 });
      }
      
      // For personal posts, we primarily use the MongoDB ObjectId approach
      // If user not found in database, return empty results since posts are created with MongoDB ObjectIds
      if (dbUser) {
        query = { userId: dbUser._id };
      } else {
        // User not found in database - return empty results
        return NextResponse.json({
          posts: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            total: 0,
            hasMore: false
          }
        });
      }
    } else if (targetUserId) {
      // For specific user posts, fetch posts by the target user ID
      // targetUserId can be either MongoDB ObjectId or Clerk user ID
      const targetUser = await User.findOne({
        $or: [
          { _id: targetUserId },
          { clerkId: targetUserId }
        ]
      });
      if (targetUser) {
        query = { userId: targetUser._id };
      } else {
        // If target user not found, return empty results
        return NextResponse.json({
          posts: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            total: 0,
            hasMore: false
          }
        });
      }
          }

    // Fetch posts from database with pagination
    let posts = [];
    let totalPosts = 0;

    if (type === 'personal' && dbUser) {
      // For personal posts, use the user's MongoDB ObjectId
      // This is the primary and most reliable approach since posts are created with MongoDB ObjectIds
      
      // Convert to ObjectId explicitly to ensure proper comparison
      const userObjectId = new mongoose.Types.ObjectId(dbUser._id);
      
      posts = await Post.find({ userId: userObjectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'userId',
          model: User,
          select: 'name email profilePicture clerkId'
        })
        .populate({
          path: 'comments',
          model: Comment,
          populate: {
            path: 'userId',
            model: User,
            select: 'name email profilePicture'
          }
        });

      totalPosts = await Post.countDocuments({ userId: userObjectId });
    } else {
      // For other queries, use the regular approach
      posts = await Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'userId',
          model: User,
          select: 'name email profilePicture clerkId'
        })
        .populate({
          path: 'comments',
          model: Comment,
          populate: {
            path: 'userId',
            model: User,
            select: 'name email profilePicture'
          }
        });

      totalPosts = await Post.countDocuments(query);
    }

    // Handle posts where userId population failed (likely Clerk ID strings)
    const postsWithUnpopulatedUsers = posts.filter(post => !post.userId || typeof post.userId === 'string');
    
    if (postsWithUnpopulatedUsers.length > 0) {
      console.log(`🔍 Found ${postsWithUnpopulatedUsers.length} posts with unpopulated userIds, attempting manual lookup`);
      
      // Get unique Clerk IDs that failed population
      const clerkIds = [...new Set(postsWithUnpopulatedUsers.map(post => post.userId).filter(Boolean))];
      
      // Find users by Clerk IDs
      const usersByClerkId = await User.find({ clerkId: { $in: clerkIds } });
      const clerkIdToUserMap = new Map();
      usersByClerkId.forEach(user => {
        clerkIdToUserMap.set(user.clerkId, user);
      });
      
      // Manually populate the failed posts
      postsWithUnpopulatedUsers.forEach(post => {
        const user = clerkIdToUserMap.get(post.userId);
        if (user) {
          post.userId = user; // Replace string with user object
        }
      });
         }

    // Format the posts for response
    const formattedPosts = posts.map(post => ({
      id: post._id.toString(),
      content: post.content,
      media: post.media || [],
      likes: post.likedBy ? post.likedBy.length : 0,
      likedBy: post.likedBy || [],
      isLikedByCurrentUser: dbUser && post.likedBy ? post.likedBy.includes(dbUser._id) : false,
      comments: (post.comments || []).map((comment: any) => ({
        id: comment._id.toString(),
        content: comment.content,
        author: comment.userId ? {
          id: comment.userId._id.toString(),
          name: comment.userId.name,
          email: comment.userId.email,
          avatar: comment.userId.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        } : { 
          id: 'unknown',
          name: 'Unknown User',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        },
        timestamp: comment.createdAt,
        likes: comment.likedBy ? comment.likedBy.length : 0,
        likedBy: comment.likedBy || [],
        isLikedByCurrentUser: dbUser && comment.likedBy ? comment.likedBy.includes(dbUser._id) : false
      })),
      author: post.userId && post.userId._id ? {
        // Successfully populated user
        id: post.userId._id.toString(),
        name: post.userId.name,
        email: post.userId.email,
        avatar: post.userId.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      } : {
        // Failed to populate user (userId might be a Clerk ID string or non-existent user)
        id: post.userId || 'unknown',
        name: 'Unknown User',
        email: 'unknown@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      },
      timestamp: post.createdAt
    }));

    // Return the formatted posts with pagination info
    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        total: totalPosts,
        hasMore: skip + posts.length < totalPosts
      }
    });
  } catch (error) {
    console.error('Error in posts API route:', error);
    // Fall back to mock data on error
    return handleMockData(request);
  }
}

// Helper function to handle mock data for unauthenticated users or errors
function handleMockData(request: NextRequest) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'all';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Filter posts if needed
  const filteredPosts = type === 'personal' 
    ? mockPosts.filter(post => post.author.id === '1') // Assuming ID 1 is the current user
    : mockPosts;
  
  // Paginate results
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  // Return results with pagination info
  return NextResponse.json({
    posts: paginatedPosts,
    pagination: {
      total: filteredPosts.length,
      page,
      limit,
      hasMore: endIndex < filteredPosts.length
    }
  });
}

// POST endpoint for creating a post
export async function POST(request: NextRequest) {
  try {
    // Verify environment variables first
    verifyEnvVariables();

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

    // Find or create user in our database
    let dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      dbUser = await User.create({
        clerkId: userId,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.emailAddresses[0].emailAddress,
        profilePicture: user.imageUrl,
      });
    }

    // Parse the form data
    const formData = await request.formData();
    const content = formData.get('content') as string;
    const images = formData.getAll('images') as File[];
    const files = formData.getAll('files') as File[];
    const video = formData.get('video') as File | null;
    const mediaDataStr = formData.get('media') as string;
    const hashtagsStr = formData.get('hashtags') as string;

    console.log('Received form data:', {
      content,
      imagesCount: images.length,
      filesCount: files.length,
      hasVideo: !!video,
      mediaDataStr,
      hashtagsStr
    });

    // Parse hashtags from client
    let hashtags: string[] = [];
    try {
      hashtags = JSON.parse(hashtagsStr || '[]');
      console.log('Parsed hashtags:', hashtags);
    } catch (e) {
      console.error('Error parsing hashtags:', e);
    }

    // Parse media data from client
    let clientMediaData = [];
    try {
      clientMediaData = JSON.parse(mediaDataStr || '[]');
      console.log('Parsed client media data:', clientMediaData);
    } catch (e) {
      console.error('Error parsing media data:', e);
    }

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    console.log('Uploading files to Bunny.net:');
    console.log('- Number of images:', images.length);
    console.log('- Number of files:', files.length);
    console.log('- Video file:', video ? 'yes' : 'no');

    // Create a queue for progress updates
    const progressQueue: { fileName: string; progress: number }[] = [];
    let isComplete = false;
    let postResponse: any = null;

    // Create a ReadableStream that will send our progress updates
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Function to send progress
          const sendProgress = (fileName: string, progress: number) => {
            progressQueue.push({ fileName, progress });
          };

          // Upload images
          const imageUrls = await Promise.all(
            images.map(async (image) => {
              const buffer = Buffer.from(await image.arrayBuffer());
              console.log('Starting image upload:', image.name);
              
              sendProgress(image.name, 0);
              controller.enqueue(`data: ${JSON.stringify({ fileName: image.name, progress: 0 })}\n\n`);
              
              const url = await bunnyClient.uploadToStorage(buffer, image.name, 'images');
              console.log('Image upload completed:', image.name, url);
              
              sendProgress(image.name, 100);
              controller.enqueue(`data: ${JSON.stringify({ fileName: image.name, progress: 100 })}\n\n`);
              
              return url;
            })
          );

          // Upload files
          const fileUrls = await Promise.all(
            files.map(async (file) => {
              const buffer = Buffer.from(await file.arrayBuffer());
              console.log('Starting file upload:', file.name);
              
              sendProgress(file.name, 0);
              controller.enqueue(`data: ${JSON.stringify({ fileName: file.name, progress: 0 })}\n\n`);
              
              const url = await bunnyClient.uploadToStorage(buffer, file.name, 'files');
              console.log('File upload completed:', file.name, url);
              
              sendProgress(file.name, 100);
              controller.enqueue(`data: ${JSON.stringify({ fileName: file.name, progress: 100 })}\n\n`);
              
              return url;
            })
          );

          // Upload video if present
          let videoUrl = '';
          if (video) {
            const buffer = Buffer.from(await video.arrayBuffer());
            console.log('Starting video upload:', video.name);
            
            sendProgress(video.name, 0);
            controller.enqueue(`data: ${JSON.stringify({ fileName: video.name, progress: 0 })}\n\n`);
            
            videoUrl = await bunnyClient.uploadToStream(buffer, video.name);
            console.log('Video upload completed:', video.name, videoUrl);
            
            sendProgress(video.name, 100);
            controller.enqueue(`data: ${JSON.stringify({ fileName: video.name, progress: 100 })}\n\n`);
          }

          // Create post with media data
          const mediaArray = await Promise.all(
            clientMediaData.map(async (media: any) => {
              // Find the corresponding uploaded URL based on the file name
              let url = '';
              if (media.type === 'image') {
                const matchingUrl = imageUrls.find(uploadedUrl => {
                  const uploadedFileName = uploadedUrl.split('/').pop(); // Get filename from URL
                  const originalFileName = media.title;
                  console.log('Matching image URL:', { uploadedUrl, uploadedFileName, originalFileName });
                  return uploadedUrl && originalFileName;
                });
                url = matchingUrl || '';
                console.log('Found matching image URL:', url);
              } else if (media.type === 'video') {
                url = videoUrl;
                console.log('Using video URL:', url);
              } else {
                const matchingUrl = fileUrls.find(uploadedUrl => {
                  const uploadedFileName = uploadedUrl.split('/').pop(); // Get filename from URL
                  const originalFileName = media.title;
                  console.log('Matching file URL:', { uploadedUrl, uploadedFileName, originalFileName });
                  return uploadedUrl && originalFileName;
                });
                url = matchingUrl || '';
                console.log('Found matching file URL:', url);
              }

              if (!url) {
                console.error('No URL found for media:', media);
                throw new Error(`No URL found for media: ${media.title}`);
              }

              return {
                type: media.type,
                url, // Use the matched URL
                title: media.title,
                size: media.size,
                thumbnail: media.type === 'video' ? `${url}/preview.jpg` : media.thumbnail,
                duration: media.duration,
                pageCount: media.pageCount
              };
            })
          );

          console.log('Final media array:', mediaArray);

          // Validate media array
          if (mediaArray.some(media => !media.url)) {
            throw new Error('Some media items are missing URLs');
          }

          // Process hashtags and create/update hashtag records
          const processedHashtags = await Promise.all(
            hashtags.map(async (hashtagName: string) => {
              const normalizedName = hashtagName.toLowerCase().trim();
              
              // Find existing hashtag or create new one
              let hashtag = await Hashtag.findOne({ name: normalizedName });
              
              if (!hashtag) {
                // Create new hashtag
                hashtag = await Hashtag.create({
                  name: normalizedName,
                  description: `Hashtag for ${normalizedName}`,
                  posts: 0,
                  followers: 0,
                  category: 'general',
                  createdBy: dbUser._id
                });
                console.log('Created new hashtag:', hashtag.name);
              }
              
              return hashtag._id;
            })
          );

          console.log('Processed hashtags:', processedHashtags);

          const post = await Post.create({
            userId: dbUser._id,
            content,
            media: mediaArray,
            hashtags: processedHashtags
          });

          // Add post ID to each hashtag's postIds array and update count
          await Promise.all(
            processedHashtags.map(async (hashtagId) => {
              const hashtag = await Hashtag.findById(hashtagId);
              if (hashtag) {
                await hashtag.addPost(post._id);
              }
            })
          );

          console.log('Created post with hashtags and updated hashtag post lists:', post.toObject());

          // Fetch the created post with author information
          const populatedPost = await Post.findById(post._id)
            .populate({
            path: 'userId',
            model: User,
            select: 'name email profilePicture',
          });

          // Try to populate hashtags separately to handle potential schema issues
          let populatedHashtags = [];
          try {
            await populatedPost.populate({
              path: 'hashtags',
              model: Hashtag,
              select: 'name followers posts',
            });
            populatedHashtags = populatedPost.hashtags || [];
          } catch (hashtagError) {
            console.warn('Could not populate hashtags:', hashtagError);
            // Fetch hashtags manually if population fails
            if (post.hashtags && post.hashtags.length > 0) {
              populatedHashtags = await Hashtag.find({ _id: { $in: post.hashtags } })
                .select('name followers posts');
            }
          }

          console.log('Populated post:', populatedPost.toObject());
          console.log('Populated hashtags:', populatedHashtags);

          // Format the response
          postResponse = {
            ...populatedPost.toObject(),
            author: {
              id: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
              avatar: dbUser.profilePicture,
            },
            media: mediaArray, // Explicitly include media array in response
            tags: populatedHashtags?.map((hashtag: any) => hashtag.name) || [], // Add hashtag names as tags
            hashtags: populatedHashtags // Include full hashtag objects
          };

          console.log('Final post response:', postResponse);

          // Send completion message
          controller.enqueue(`data: ${JSON.stringify({ type: 'complete', post: postResponse })}\n\n`);
          controller.close();
        } catch (error) {
          console.error('Error in stream:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating post' },
      { status: 500 }
    );
  }
} 