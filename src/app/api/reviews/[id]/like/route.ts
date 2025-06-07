import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import mongoose from 'mongoose';

// POST - Like a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const { id: reviewId } = await params;

    // Find the current user
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user has already liked the review
    const isLiked = review.likedBy.some((id: mongoose.Types.ObjectId) => id.equals(currentUser._id));
    
    // Toggle like
    if (isLiked) {
      // Remove like
      review.likedBy = review.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(currentUser._id));
    } else {
      // Add like
      review.likedBy.push(currentUser._id);
    }
    
    // Update likes count and save
    review.likesCount = review.likedBy.length;
    await review.save();

    return NextResponse.json({
      success: true,
      likes: review.likesCount,
      isLiked: !isLiked
    });

  } catch (error: any) {
    console.error('Error toggling review like:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 