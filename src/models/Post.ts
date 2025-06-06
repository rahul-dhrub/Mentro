import mongoose from 'mongoose';

export interface Media {
  type: 'image' | 'video' | 'pdf' | 'document' | 'emoji';
  url?: string;
  thumbnail?: string;
  title?: string;
  size?: string;
  duration?: string;
  pageCount?: number;
  code?: string; // For emojis
}

export interface IPost extends mongoose.Document {
  userId: mongoose.Types.ObjectId | string;
  content: string;
  media: Media[];
  comments: mongoose.Types.ObjectId[] | string[];
  likedBy: mongoose.Types.ObjectId[]; // Users who liked this post
  likesCount: number; // Virtual field
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'pdf', 'document', 'emoji']
  },
  url: String,
  thumbnail: String,
  title: String,
  size: String,
  duration: String,
  pageCount: Number,
  code: String // For emojis
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
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }],
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
postSchema.virtual('likesCount').get(function() {
  return this.likedBy ? this.likedBy.length : 0;
});

// Virtual populate for author
postSchema.virtual('author', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export default Post;