import mongoose from 'mongoose';

export interface IHashtag extends mongoose.Document {
  name: string;
  description: string;
  posts: number;
  postIds: mongoose.Types.ObjectId[];
  blogs: number;
  blogIds: mongoose.Types.ObjectId[];
  followers: number;
  category?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Method declarations
  incrementPosts(): Promise<IHashtag>;
  decrementPosts(): Promise<IHashtag>;
  incrementFollowers(): Promise<IHashtag>;
  decrementFollowers(): Promise<IHashtag>;
  addPost(postId: mongoose.Types.ObjectId): Promise<IHashtag>;
  removePost(postId: mongoose.Types.ObjectId): Promise<IHashtag>;
  addBlog(blogId: mongoose.Types.ObjectId): Promise<IHashtag>;
  removeBlog(blogId: mongoose.Types.ObjectId): Promise<IHashtag>;
}

const hashtagSchema = new mongoose.Schema<IHashtag>(
  {
    name: {
      type: String,
      required: [true, 'Hashtag name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [50, 'Hashtag name cannot be more than 50 characters'],
      match: [/^#?[a-zA-Z0-9_]+$/, 'Hashtag must contain only letters, numbers, and underscores'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [200, 'Description cannot be more than 200 characters'],
      trim: true,
    },
    posts: {
      type: Number,
      default: 0,
      min: [0, 'Posts count cannot be negative'],
    },
    postIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Post',
    },
    blogs: {
      type: Number,
      default: 0,
      min: [0, 'Blogs count cannot be negative'],
    },
    blogIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Blog',
    },
    followers: {
      type: Number,
      default: 0,
      min: [0, 'Followers count cannot be negative'],
    },
    category: {
      type: String,
      enum: ['education', 'research', 'technology', 'science', 'general'],
      default: 'general',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
// Note: name field already has unique index from schema definition
hashtagSchema.index({ category: 1 });
hashtagSchema.index({ isActive: 1 });
hashtagSchema.index({ posts: -1 }); // Descending order for popular hashtags
hashtagSchema.index({ followers: -1 }); // Descending order for popular hashtags by followers
hashtagSchema.index({ name: 'text', description: 'text' }); // Text search index
hashtagSchema.index({ postIds: 1 }); // Index for post ID lookups
hashtagSchema.index({ blogIds: 1 }); // Index for blog ID lookups

// Ensure hashtag name starts with #
hashtagSchema.pre('save', function(this: IHashtag, next) {
  if (!this.name.startsWith('#')) {
    this.name = '#' + this.name;
  }
  next();
});

// Instance methods
hashtagSchema.methods.incrementPosts = function() {
  this.posts += 1;
  return this.save();
};

hashtagSchema.methods.decrementPosts = function() {
  if (this.posts > 0) {
    this.posts -= 1;
  }
  return this.save();
};

hashtagSchema.methods.incrementFollowers = function() {
  this.followers += 1;
  return this.save();
};

hashtagSchema.methods.decrementFollowers = function() {
  if (this.followers > 0) {
    this.followers -= 1;
  }
  return this.save();
};

hashtagSchema.methods.addPost = function(postId: mongoose.Types.ObjectId) {
  // Use proper ObjectId comparison
  const exists = this.postIds.some((id: mongoose.Types.ObjectId) => id.equals(postId));
  if (!exists) {
    this.postIds.push(postId);
    this.posts = this.postIds.length;
  }
  return this.save();
};

hashtagSchema.methods.removePost = function(postId: mongoose.Types.ObjectId) {
  this.postIds = this.postIds.filter((id: mongoose.Types.ObjectId) => !id.equals(postId));
  this.posts = this.postIds.length;
  return this.save();
};

// Blog methods
hashtagSchema.methods.addBlog = function(blogId: mongoose.Types.ObjectId) {
  // Use proper ObjectId comparison
  const exists = this.blogIds.some((id: mongoose.Types.ObjectId) => id.equals(blogId));
  if (!exists) {
    this.blogIds.push(blogId);
    this.blogs = this.blogIds.length;
  }
  return this.save();
};

hashtagSchema.methods.removeBlog = function(blogId: mongoose.Types.ObjectId) {
  this.blogIds = this.blogIds.filter((id: mongoose.Types.ObjectId) => !id.equals(blogId));
  this.blogs = this.blogIds.length;
  return this.save();
};

// Clear mongoose model cache if it exists
delete mongoose.models.Hashtag;

const Hashtag = mongoose.models.Hashtag || mongoose.model<IHashtag>('Hashtag', hashtagSchema);

export default Hashtag; 