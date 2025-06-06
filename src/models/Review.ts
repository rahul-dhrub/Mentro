import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  // Review targets - either courseId or targetUserId should be set
  courseId?: mongoose.Types.ObjectId; // For course reviews
  targetUserId?: mongoose.Types.ObjectId; // For user profile reviews
  reviewType: 'course' | 'user'; // Type of review
  
  // Review author
  userId: mongoose.Types.ObjectId; // Who wrote the review
  
  // Review content
  rating: number; // 1-5 stars
  comment: string;
  
  // Engagement
  commentIds: mongoose.Types.ObjectId[]; // Array of comment/reply IDs
  likedBy: mongoose.Types.ObjectId[]; // Array of user IDs who liked this review
  likesCount: number; // Calculated field for performance
  
  // Moderation
  isApproved: boolean;
  isHelpful: number; // Count of helpful votes (separate from likes)
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    // Review targets - either courseId or targetUserId should be set
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: false, // Optional since it could be a user review
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional since it could be a course review
    },
    reviewType: {
      type: String,
      enum: ['course', 'user'],
      required: true,
    },
    
    // Review author
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Review content
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    
    // Engagement
    commentIds: [{
      type: Schema.Types.ObjectId,
      ref: 'ReviewComment', // Reference to ReviewComment model instead of Comment
    }],
    likedBy: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    likesCount: {
      type: Number,
      default: 0,
    },
    
    // Moderation
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve reviews, can be changed to false for moderation
    },
    isHelpful: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ReviewSchema.index({ courseId: 1 });
ReviewSchema.index({ targetUserId: 1 });
ReviewSchema.index({ userId: 1 });
ReviewSchema.index({ reviewType: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ likesCount: -1 }); // For popular reviews

// Compound indexes
ReviewSchema.index({ courseId: 1, userId: 1 }, { unique: true, sparse: true }); // One review per user per course
ReviewSchema.index({ targetUserId: 1, userId: 1 }, { unique: true, sparse: true }); // One review per user per target user

// Validation: Ensure either courseId or targetUserId is set based on reviewType
ReviewSchema.pre('validate', function(this: IReview, next) {
  if (this.reviewType === 'course') {
    if (!this.courseId) {
      return next(new Error('courseId is required for course reviews'));
    }
    if (this.targetUserId) {
      return next(new Error('targetUserId should not be set for course reviews'));
    }
  } else if (this.reviewType === 'user') {
    if (!this.targetUserId) {
      return next(new Error('targetUserId is required for user reviews'));
    }
    if (this.courseId) {
      return next(new Error('courseId should not be set for user reviews'));
    }
  }
  next();
});

// Pre-save middleware to update calculated fields
ReviewSchema.pre('save', function(this: IReview, next) {
  // Update likes count from likedBy array
  this.likesCount = this.likedBy ? this.likedBy.length : 0;
  next();
});

// Methods for managing likes
ReviewSchema.methods.addLike = function(userId: mongoose.Types.ObjectId) {
  if (!this.likedBy.some((id: mongoose.Types.ObjectId) => id.equals(userId))) {
    this.likedBy.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

ReviewSchema.methods.removeLike = function(userId: mongoose.Types.ObjectId) {
  this.likedBy = this.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));
  return this.save();
};

ReviewSchema.methods.toggleLike = function(userId: mongoose.Types.ObjectId) {
  const isLiked = this.likedBy.some((id: mongoose.Types.ObjectId) => id.equals(userId));
  if (isLiked) {
    return this.removeLike(userId);
  } else {
    return this.addLike(userId);
  }
};

// Methods for managing comments
ReviewSchema.methods.addComment = function(commentId: mongoose.Types.ObjectId) {
  this.commentIds.push(commentId);
  return this.save();
};

ReviewSchema.methods.removeComment = function(commentId: mongoose.Types.ObjectId) {
  this.commentIds = this.commentIds.filter((id: mongoose.Types.ObjectId) => !id.equals(commentId));
  return this.save();
};

// Clear mongoose model cache if it exists
delete mongoose.models.Review;

const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review; 