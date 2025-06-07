import mongoose from 'mongoose';

export interface IHashtag extends mongoose.Document {
  name: string;
  description: string;
  posts: number;
  category?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
hashtagSchema.index({ name: 1 });
hashtagSchema.index({ category: 1 });
hashtagSchema.index({ isActive: 1 });
hashtagSchema.index({ posts: -1 }); // Descending order for popular hashtags

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

// Clear mongoose model cache if it exists
delete mongoose.models.Hashtag;

const Hashtag = mongoose.models.Hashtag || mongoose.model<IHashtag>('Hashtag', hashtagSchema);

export default Hashtag; 