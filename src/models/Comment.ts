import mongoose from 'mongoose';
import { Media } from './Post';

export interface IComment extends mongoose.Document {
  userId: mongoose.Types.ObjectId | string;
  postId: mongoose.Types.ObjectId | string;
  content: string;
  media?: Media[];
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
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for author
commentSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', commentSchema);

export default Comment; 