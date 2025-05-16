import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import User from '@/models/User';
import { bunnyClient } from '@/lib/bunny';

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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get the search params
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'personal' or 'all'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Find the current user in our database
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let query = {};
    if (type === 'personal') {
      // For personal posts, only fetch posts by the current user
      query = { userId: dbUser._id };
    }

    // Fetch posts with pagination and populate author information
    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        model: User,
        select: 'name email profilePicture'
      });

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);

    // Format the posts response
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      author: {
        id: post.userId._id,
        name: post.userId.name,
        email: post.userId.email,
        avatar: post.userId.profilePicture
      }
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasMore: skip + posts.length < totalPosts
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error fetching posts' },
      { status: 500 }
    );
  }
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

    console.log('Received form data:', {
      content,
      imagesCount: images.length,
      filesCount: files.length,
      hasVideo: !!video,
      mediaDataStr
    });

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

          const post = await Post.create({
            userId: dbUser._id,
            content,
            media: mediaArray
          });

          console.log('Created post:', post.toObject());

          // Fetch the created post with author information
          const populatedPost = await Post.findById(post._id).populate({
            path: 'userId',
            model: User,
            select: 'name email profilePicture',
          });

          console.log('Populated post:', populatedPost.toObject());

          // Format the response
          postResponse = {
            ...populatedPost.toObject(),
            author: {
              id: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
              avatar: dbUser.profilePicture,
            },
            media: mediaArray // Explicitly include media array in response
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