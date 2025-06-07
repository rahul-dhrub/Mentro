import mongoose from 'mongoose';

export interface Author {
  id: string;
  name: string;
  avatar: string;
}

export interface IBlog extends mongoose.Document {
  title: string;
  content: string;
  coverImage: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  hashtags: mongoose.Types.ObjectId[];
  readTime: number;
}

const authorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  }
}, { _id: false });

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    coverImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3'
    },
    excerpt: {
      type: String,
      required: true
    },
    author: {
      type: authorSchema,
      required: true
    },
    tags: {
      type: [String],
      default: []
    },
    hashtags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Hashtag',
      default: []
    },
    readTime: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

export default Blog; 