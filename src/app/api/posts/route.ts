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

          // Create post
          const post = await Post.create({
            userId: dbUser._id,
            content,
            images: imageUrls,
            files: fileUrls,
            video: videoUrl,
          });

          // Fetch the created post with author information
          const populatedPost = await Post.findById(post._id).populate({
            path: 'userId',
            model: User,
            select: 'name email profilePicture',
          });

          // Format the response
          postResponse = {
            ...populatedPost.toObject(),
            author: {
              id: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
              avatar: dbUser.profilePicture,
            }
          };

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