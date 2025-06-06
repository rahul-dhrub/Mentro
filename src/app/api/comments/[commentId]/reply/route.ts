import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { uploadToBunnyStorage } from '@/app/feed/utils/bunnyStorage';
import mongoose from 'mongoose';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
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
    
    const { commentId } = await params;

    if (!content && imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'Reply content or media is required' },
        { status: 400 }
      );
    }

    // Check if commentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }

    const parentComment = await Comment.findById(new mongoose.Types.ObjectId(commentId));
    if (!parentComment) {
      return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
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

    // Create the reply comment
    const reply = await Comment.create({
      userId: dbUser._id,
      userEmail: dbUser.email,
      userName: dbUser.name,
      postId: parentComment.postId,
      content,
      media,
      parentCommentId: parentComment._id
    });

    // Add reply to parent comment's replies array
    if (!parentComment.replies) {
      parentComment.replies = [];
    }
    parentComment.replies.push(reply._id);
    await parentComment.save();

    return NextResponse.json({
      reply: {
        id: reply._id,
        content: reply.content,
        media: reply.media,
        author: {
          id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          avatar: dbUser.profilePicture || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
        },
        timestamp: reply.createdAt,
        likes: 0,
        likedBy: [],
        isLikedByCurrentUser: false,
        parentCommentId: commentId,
        replies: [],
        repliesCount: 0
      }
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
} 