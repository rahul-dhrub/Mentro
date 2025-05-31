import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { uploadToBunnyStorage } from '@/app/feed/utils/bunnyStorage';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const imageFiles = formData.getAll('images') as File[];
    
    // Get postId after ensuring params is resolved
    const { postId } = await params;

    if (!content && imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'Comment content or media is required' },
        { status: 400 }
      );
    }

    // Check if postId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      );
    }

    const post = await Post.findById(new mongoose.Types.ObjectId(postId));
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upload images to Bunny storage
    const media = await Promise.all(
      imageFiles.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const url = await uploadToBunnyStorage(
          buffer,
          `comments/images/${file.name}`,
          file.type
        );
        return {
          type: 'image' as const,
          url,
          title: file.name
        };
      })
    );

    const comment = await Comment.create({
      userId: dbUser._id,
      userEmail: dbUser.email,
      userName: dbUser.name,
      postId: post._id,
      content,
      media
    });

    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();

    return NextResponse.json({
      comment: {
        id: comment._id,
        content: comment.content,
        media: comment.media,
        author: {
          id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          avatar: dbUser.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        },
        timestamp: comment.createdAt,
        likes: 0
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const emailFilter = url.searchParams.get('email');
    
    // Get postId after ensuring params is resolved
    const { postId } = await params;

    // Check if postId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { error: 'Invalid post ID format' },
        { status: 400 }
      );
    }

    const post = await Post.findById(new mongoose.Types.ObjectId(postId))
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          model: User,
          select: 'name profilePicture email'
        }
      });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

    let comments = post.comments;
    if (emailFilter) {
      comments = comments.filter((comment: any) =>
        comment.userEmail === emailFilter ||
        (comment.author && comment.author.email === emailFilter)
      );
    }

    const formattedComments = comments.map((comment: any) => {
      const author = comment.author || { name: comment.userName || 'Unknown User', email: comment.userEmail, profilePicture: defaultAvatar };
      return {
        id: comment._id,
        content: comment.content,
        media: comment.media || [],
        author: {
          id: author._id || 'unknown',
          name: author.name || comment.userName || 'Unknown User',
          email: author.email || comment.userEmail || '',
          avatar: author.profilePicture || defaultAvatar
        },
        timestamp: comment.createdAt,
        likes: 0
      };
    });

    return NextResponse.json({ comments: formattedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
} 