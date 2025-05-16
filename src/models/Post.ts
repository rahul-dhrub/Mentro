import mongoose from 'mongoose';

export interface IPost extends mongoose.Document {
  userId: mongoose.Types.ObjectId | string;
  content: string;
  images: string[];
  files: string[];
  video?: string;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new mongoose.Schema<IPost>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User'
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
    },
    images: [{
      type: String,
      default: [],
    }],
    files: [{
      type: String,
      default: [],
    }],
    video: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate for author
postSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;