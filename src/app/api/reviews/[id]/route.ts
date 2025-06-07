import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import mongoose from 'mongoose';

// DELETE - Delete a review (only by the author)
export async function DELETE(
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

    // Check if the current user is the author of the review
    if (!review.userId.equals(currentUser._id)) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Get the target user to remove the review from their reviewIds
    let targetUser = null;
    if (review.reviewType === 'user' && review.targetUserId) {
      targetUser = await User.findById(review.targetUserId);
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Remove the review ID from the target user's reviewIds array
    if (targetUser) {
      targetUser.reviewIds = targetUser.reviewIds.filter(
        (id: mongoose.Types.ObjectId) => !id.equals(review._id)
      );
      await targetUser.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 