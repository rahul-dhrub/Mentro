import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import User from '@/models/User';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { content, media } = await request.json();
    if (!content && (!media || media.length === 0)) {
      return NextResponse.json(
        { error: 'Comment content or media is required' },
        { status: 400 }
      );
    }

    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const comment = await Comment.create({
      userId: dbUser._id,
      postId: post._id,
      content,
      media: media || []
    });

    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();

    // Populate author information
    await comment.populate('author');

    return NextResponse.json({
      comment: {
        id: comment._id,
        content: comment.content,
        media: comment.media,
        author: {
          id: dbUser._id,
          name: dbUser.name,
          avatar: dbUser.profilePicture
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
  { params }: { params: { postId: string } }
) {
  try {
    await connectDB();

    const post = await Post.findById(params.postId)
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          model: User,
          select: 'name profilePicture'
        }
      });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const comments = post.comments.map((comment: any) => ({
      id: comment._id,
      content: comment.content,
      media: comment.media,
      author: {
        id: comment.author._id,
        name: comment.author.name,
        avatar: comment.author.profilePicture
      },
      timestamp: comment.createdAt,
      likes: 0
    }));

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
} 