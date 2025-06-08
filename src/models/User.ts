import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  clerkId: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  bannerImage?: string;
  bio?: string;
  title?: string;
  department?: string;
  location?: string;
  dateOfBirth?: string;
  role: 'admin' | 'instructor' | 'student';
  isOnline: boolean;
  lastActive: Date;
  
  // Extended profile fields
  expertise: string[];
  achievements: string[];
  introVideo?: string;
  social: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  
  // User activity and relationships
  ratings: number[]; // Array of ratings given/received by this user
  reviewIds: mongoose.Types.ObjectId[]; // Array of review IDs associated with this user
  ownedCourseIds: mongoose.Types.ObjectId[]; // Array of course IDs owned by this user (for instructors)
  enrolledCourseIds: mongoose.Types.ObjectId[]; // Array of course IDs user is enrolled in (for students)
  
  // Social connections
  followers: mongoose.Types.ObjectId[]; // Array of user IDs who follow this user
  following: mongoose.Types.ObjectId[]; // Array of user IDs this user follows
  followedHashtags: mongoose.Types.ObjectId[]; // Array of hashtag IDs this user follows
  
  // User statistics
  averageRating: number; // Average rating as an instructor
  totalReviews: number; // Total number of reviews received as instructor
  totalStudents: number; // Total students across all owned courses
  totalHours: number; // Total hours of content taught/learned
  
  createdAt: Date;
  updatedAt: Date;
}

// Social links sub-schema
const socialSchema = new mongoose.Schema({
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  website: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot be more than 1000 characters'],
      default: '',
    },
    title: {
      type: String,
      default: 'Faculty Member',
    },
    department: {
      type: String,
      default: 'Computer Science',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'instructor', 'student'],
      default: 'admin',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    
    // Extended profile fields
    expertise: [{
      type: String,
      trim: true,
      maxlength: [50, 'Expertise item cannot be more than 50 characters'],
    }],
    achievements: [{
      type: String,
      trim: true,
      maxlength: [200, 'Achievement cannot be more than 200 characters'],
    }],
    introVideo: {
      type: String,
      default: '',
    },
    social: {
      type: socialSchema,
      default: () => ({}),
    },
    
    // User activity and relationships
    ratings: [{
      type: Number,
      min: 1,
      max: 5,
    }],
    reviewIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    }],
    ownedCourseIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    enrolledCourseIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    
    // Social connections
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    followedHashtags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hashtag',
    }],
    
    // User statistics
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate statistics
userSchema.pre('save', function(this: IUser, next) {
  // Calculate average rating
  if (this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating, 0);
    this.averageRating = sum / this.ratings.length;
  } else {
    this.averageRating = 0;
  }
  
  // Set total reviews count
  this.totalReviews = this.reviewIds.length;
  
  next();
});

// Instance methods
userSchema.methods.addRating = function(rating: number) {
  if (rating >= 1 && rating <= 5) {
    this.ratings.push(rating);
    return this.save();
  }
  throw new Error('Rating must be between 1 and 5');
};

userSchema.methods.addReview = function(reviewId: mongoose.Types.ObjectId) {
  if (!this.reviewIds.includes(reviewId)) {
    this.reviewIds.push(reviewId);
    return this.save();
  }
  return this;
};

userSchema.methods.addOwnedCourse = function(courseId: mongoose.Types.ObjectId) {
  if (!this.ownedCourseIds.includes(courseId)) {
    this.ownedCourseIds.push(courseId);
    return this.save();
  }
  return this;
};

userSchema.methods.removeOwnedCourse = function(courseId: mongoose.Types.ObjectId) {
  this.ownedCourseIds = this.ownedCourseIds.filter((id: mongoose.Types.ObjectId) => !id.equals(courseId));
  return this.save();
};

userSchema.methods.enrollInCourse = function(courseId: mongoose.Types.ObjectId) {
  if (!this.enrolledCourseIds.includes(courseId)) {
    this.enrolledCourseIds.push(courseId);
    return this.save();
  }
  return this;
};

userSchema.methods.unenrollFromCourse = function(courseId: mongoose.Types.ObjectId) {
  this.enrolledCourseIds = this.enrolledCourseIds.filter((id: mongoose.Types.ObjectId) => !id.equals(courseId));
  return this.save();
};

userSchema.methods.updateTotalStudents = async function() {
  if (this.role === 'instructor') {
    const Course = mongoose.model('Course');
    const courses = await Course.find({ instructorId: this._id });
    this.totalStudents = courses.reduce((total, course) => total + course.totalStudents, 0);
    return this.save();
  }
  return this;
};

// Social connection methods
userSchema.methods.followUser = function(userId: mongoose.Types.ObjectId) {
  if (!this.following.includes(userId) && !this._id.equals(userId)) {
    this.following.push(userId);
    return this.save();
  }
  return this;
};

userSchema.methods.unfollowUser = function(userId: mongoose.Types.ObjectId) {
  this.following = this.following.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));
  return this.save();
};

userSchema.methods.addFollower = function(userId: mongoose.Types.ObjectId) {
  if (!this.followers.includes(userId) && !this._id.equals(userId)) {
    this.followers.push(userId);
    return this.save();
  }
  return this;
};

userSchema.methods.removeFollower = function(userId: mongoose.Types.ObjectId) {
  this.followers = this.followers.filter((id: mongoose.Types.ObjectId) => !id.equals(userId));
  return this.save();
};

// Clear mongoose model cache if it exists
delete mongoose.models.User;

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 