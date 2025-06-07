import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Review from '@/models/Review';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET reviews for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: targetUserId } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const rating = url.searchParams.get('rating');
    const sortBy = url.searchParams.get('sortBy') || 'newest';
    
    // Find the target user by their MongoDB ID or Clerk ID
    let targetUser = null;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      targetUser = await User.findById(targetUserId);
    } else {
      targetUser = await User.findOne({ clerkId: targetUserId });
    }
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build query for reviews
    const query: any = {
      targetUserId: targetUser._id,
      reviewType: 'user',
      isApproved: true
    };

    // Add rating filter if specified
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    // Build sort criteria
    let sortCriteria: any = {};
    switch (sortBy) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'highest':
        sortCriteria = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortCriteria = { rating: 1, createdAt: -1 };
        break;
      case 'popular':
        sortCriteria = { likesCount: -1, createdAt: -1 };
        break;
      default:
        sortCriteria = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate('userId', 'name email profilePicture')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    const totalReviews = await Review.countDocuments(query);

    // Get current user to check if they liked reviews
    let currentUser = null;
    try {
      const { userId } = await auth();
      if (userId) {
        currentUser = await User.findOne({ clerkId: userId });
      }
    } catch (error) {
      // User not authenticated, continue without current user
    }

    // Format reviews for response
    const formattedReviews = reviews.map((review: any) => ({
      id: review._id.toString(),
      userId: review.userId._id.toString(),
      userName: review.userId.name,
      userAvatar: review.userId.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId.name)}&background=0D8ABC&color=fff`,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      likes: review.likesCount || 0,
      isLikedByCurrentUser: currentUser ? review.likedBy.some((id: any) => id.equals(currentUser._id)) : false
    }));

    // Calculate average rating and distribution
    const allUserReviews = await Review.find({
      targetUserId: targetUser._id,
      reviewType: 'user',
      isApproved: true
    }).lean();

    const averageRating = allUserReviews.length > 0 
      ? allUserReviews.reduce((sum, review) => sum + review.rating, 0) / allUserReviews.length 
      : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allUserReviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    return NextResponse.json({
      success: true,
      reviews: formattedReviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        total: totalReviews,
        hasMore: skip + reviews.length < totalReviews
      },
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: allUserReviews.length,
      ratingDistribution
    });

  } catch (error: any) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new review for a user
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
    
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    // Find the current user (reviewer)
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Current user not found' },
        { status: 404 }
      );
    }

    // Find the target user (to be reviewed)
    let targetUser = null;
    if (mongoose.Types.ObjectId.isValid(targetUserId)) {
      targetUser = await User.findById(targetUserId);
    } else {
      targetUser = await User.findOne({ clerkId: targetUserId });
    }
    
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    // Check if user is trying to review themselves
    if (currentUser._id.equals(targetUser._id)) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this target user
    const existingReview = await Review.findOne({
      userId: currentUser._id,
      targetUserId: targetUser._id,
      reviewType: 'user'
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this user' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await Review.create({
      userId: currentUser._id,
      targetUserId: targetUser._id,
      reviewType: 'user',
      rating,
      comment: comment.trim()
    });

    // Add review ID to target user's reviewIds array
    await targetUser.addReview(review._id);

    // Populate the review for response
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email profilePicture')
      .lean();

    const user = populatedReview!.userId as any;
    const formattedReview = {
      id: populatedReview!._id.toString(),
      userId: user._id.toString(),
      userName: user.name,
      userAvatar: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`,
      rating: populatedReview!.rating,
      comment: populatedReview!.comment,
      createdAt: populatedReview!.createdAt,
      likes: 0,
      isLikedByCurrentUser: false
    };

    return NextResponse.json({
      success: true,
      message: 'Review created successfully',
      review: formattedReview
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating review:', error);
    
    // Handle duplicate key error (should not happen due to pre-check, but just in case)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already reviewed this user' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 