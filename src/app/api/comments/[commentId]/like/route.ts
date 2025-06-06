/**
 * @swagger
 * /api/comments/{commentId}/like:
 *   post:
 *     summary: Toggle like on a comment
 *     description: Like or unlike a comment. If the user has already liked the comment, it will be unliked, and vice versa.
 *     tags: [Comments]
 *     security:
 *       - ClerkAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the comment
 *     responses:
 *       200:
 *         description: Like status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 liked:
 *                   type: boolean
 *                   description: Whether the comment is now liked by the user
 *                   example: true
 *                 likesCount:
 *                   type: integer
 *                   description: Total number of likes on the comment
 *                   example: 5
 *       400:
 *         description: Invalid comment ID format
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
 *       404:
 *         description: Comment or user not found
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
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Comment from '@/models/Comment';
import User from '@/models/User';
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

    const { commentId } = await params;

    // Check if commentId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { error: 'Invalid comment ID format' },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(new mongoose.Types.ObjectId(commentId));
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userObjectId = dbUser._id;
    const isAlreadyLiked = comment.likedBy.includes(userObjectId);

    if (isAlreadyLiked) {
      // Unlike the comment
      comment.likedBy = comment.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userObjectId));
    } else {
      // Like the comment
      comment.likedBy.push(userObjectId);
    }

    await comment.save();

    return NextResponse.json({
      success: true,
      liked: !isAlreadyLiked,
      likesCount: comment.likedBy.length
    });
  } catch (error) {
    console.error('Error toggling comment like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
} 