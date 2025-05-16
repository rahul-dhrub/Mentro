import mongoose from 'mongoose';

interface Media {
  type: 'image' | 'video' | 'pdf' | 'document';
  url: string;
  thumbnail?: string;
  title?: string;
  size?: string;
  duration?: string;
  pageCount?: number;
}

export interface IPost extends mongoose.Document {
  userId: mongoose.Types.ObjectId | string;
  content: string;
  media: Media[];
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'pdf', 'document']
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: String,
  title: String,
  size: String,
  duration: String,
  pageCount: Number
}, { _id: false });

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
    media: {
      type: [mediaSchema],
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
postSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;