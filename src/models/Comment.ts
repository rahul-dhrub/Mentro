import mongoose from 'mongoose';
import { Media } from './Post';

export interface IComment extends mongoose.Document {
  userId: mongoose.Types.ObjectId | string;
  userEmail: string;
  userName: string;
  postId: mongoose.Types.ObjectId | string;
  content: string;
  media?: Media[];
  parentCommentId?: mongoose.Types.ObjectId; // For replies to comments
  replies: mongoose.Types.ObjectId[]; // Child comments
  likedBy: mongoose.Types.ObjectId[]; // Users who liked this comment
  likesCount: number; // Virtual field
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new mongoose.Schema<IComment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User'
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required']
    },
    userName: {
      type: String,
      required: [true, 'User name is required']
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Post ID is required'],
      ref: 'Post'
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
    },
    media: {
      type: [{
        type: {
          type: String,
          required: true,
          enum: ['image', 'emoji']
        },
        url: String, // For images
        code: String, // For emojis
        position: Number // Position in the content where media should be inserted
      }],
      default: []
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null // null for top-level comments
    },
    replies: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }],
      default: []
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for likes count
commentSchema.virtual('likesCount').get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

// Virtual populate for author
commentSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Index for performance
commentSchema.index({ postId: 1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ userId: 1 });

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default Comment; 