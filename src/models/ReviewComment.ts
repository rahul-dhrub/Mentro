import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewComment extends Document {
  _id: string;
  reviewId: mongoose.Types.ObjectId; // Parent review
  userId: mongoose.Types.ObjectId; // Comment author
  content: string;
  
  // Nested comments (replies)
  parentCommentId?: mongoose.Types.ObjectId; // For threaded comments
  replyIds: mongoose.Types.ObjectId[]; // Direct replies to this comment
  
  // Engagement
  likedBy: mongoose.Types.ObjectId[]; // Users who liked this comment
  likesCount: number; // Calculated field
  
  // Moderation
  isApproved: boolean;
  isEdited: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ReviewCommentSchema = new Schema<IReviewComment>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500, // Shorter than review comments
    },
    
    // Nested structure
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewComment',
      required: false, // Only set for replies
    },
    replyIds: [{
      type: Schema.Types.ObjectId,
      ref: 'ReviewComment',
    }],
    
    // Engagement
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
      default: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ReviewCommentSchema.index({ reviewId: 1 });
ReviewCommentSchema.index({ userId: 1 });
ReviewCommentSchema.index({ parentCommentId: 1 });
ReviewCommentSchema.index({ createdAt: -1 });

// Pre-save middleware to update calculated fields
ReviewCommentSchema.pre('save', function(this: IReviewComment, next) {
  // Update likes count
  this.likesCount = this.likedBy ? this.likedBy.length : 0;
  next();
});

// Methods for managing likes
ReviewCommentSchema.methods.addLike = function(userId: mongoose.Types.ObjectId) {
  if (!this.likedBy.some((id: mongoose.Types.ObjectId) => id.equals(userId))) {
    this.likedBy.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

ReviewCommentSchema.methods.removeLike = function(userId: mongoose.Types.ObjectId) {
  this.likedBy = this.likedBy.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));
  return this.save();
};

ReviewCommentSchema.methods.toggleLike = function(userId: mongoose.Types.ObjectId) {
  const isLiked = this.likedBy.some((id: mongoose.Types.ObjectId) => id.equals(userId));
  if (isLiked) {
    return this.removeLike(userId);
  } else {
    return this.addLike(userId);
  }
};

// Methods for managing replies
ReviewCommentSchema.methods.addReply = function(replyId: mongoose.Types.ObjectId) {
  this.replyIds.push(replyId);
  return this.save();
};

ReviewCommentSchema.methods.removeReply = function(replyId: mongoose.Types.ObjectId) {
  this.replyIds = this.replyIds.filter((id: mongoose.Types.ObjectId) => !id.equals(replyId));
  return this.save();
};

// Clear mongoose model cache if it exists
delete mongoose.models.ReviewComment;

const ReviewComment = mongoose.model<IReviewComment>('ReviewComment', ReviewCommentSchema);

export default ReviewComment; 