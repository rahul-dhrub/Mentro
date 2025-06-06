import mongoose, { Schema, Document } from 'mongoose';

export interface IFaculty {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'faculty';
  avatar?: string;
  joinedAt: Date;
}

export interface ICourse extends Document {
  _id: string;
  title: string;
  description: string;
  code: string; // Course code (e.g., CS101)
  instructorId: mongoose.Types.ObjectId; // Reference to User
  faculty: IFaculty[]; // Faculty members for this course
  students: mongoose.Types.ObjectId[]; // Array of student IDs
  chapters: mongoose.Types.ObjectId[]; // Array of chapter IDs
  
  // Course metadata
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  
  // Course content
  features: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  
  // Status and visibility
  isPublished: boolean;
  isActive: boolean;
  
  // Analytics
  totalStudents: number;
  rating: number; // Average rating (calculated from ratings array)
  ratings: number[]; // Individual ratings (1-5)
  reviews: number; // Total review count (calculated from reviewIds length)
  reviewIds: mongoose.Types.ObjectId[]; // Array of review IDs
  
  // Timestamps
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdated: Date; // Explicit last updated field
}

const FacultySchema = new Schema<IFaculty>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['owner', 'faculty'],
    required: true,
  },
  avatar: {
    type: String,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    faculty: [FacultySchema],
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    chapters: [{
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
    }],
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    duration: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    thumbnail: {
      type: String,
    },
    features: [{
      type: String,
    }],
    requirements: [{
      type: String,
    }],
    whatYouWillLearn: [{
      type: String,
    }],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratings: [{
      type: Number,
      min: 1,
      max: 5,
    }],
    reviews: {
      type: Number,
      default: 0,
    },
    reviewIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Review',
    }],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
CourseSchema.index({ createdBy: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ isPublished: 1, isActive: 1 });
CourseSchema.index({ 'faculty.email': 1 });

// Pre-save middleware to update calculated fields
CourseSchema.pre('save', function(this: ICourse, next) {
  // Update total students count
  this.totalStudents = this.students.length;
  
  // Calculate average rating from ratings array
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating, 0);
    this.rating = Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal place
  } else {
    this.rating = 0;
  }
  
  // Update review count from reviewIds array
  this.reviews = this.reviewIds ? this.reviewIds.length : 0;
  
  // Update lastUpdated timestamp
  this.lastUpdated = new Date();
  
  next();
});

// Methods for faculty management
CourseSchema.methods.addFaculty = function(facultyData: Omit<IFaculty, 'id' | 'joinedAt'>) {
  const newFaculty: IFaculty = {
    id: new mongoose.Types.ObjectId().toString(),
    ...facultyData,
    joinedAt: new Date(),
  };
  this.faculty.push(newFaculty);
  return this.save();
};

CourseSchema.methods.removeFaculty = function(facultyId: string) {
  this.faculty = this.faculty.filter((f: IFaculty) => f.id !== facultyId);
  return this.save();
};

CourseSchema.methods.transferOwnership = function(newOwnerEmail: string) {
  // Remove owner role from current owner
  this.faculty = this.faculty.map((f: IFaculty) => 
    f.role === 'owner' ? { ...f, role: 'faculty' as const } : f
  );
  
  // Make the new faculty member the owner
  const newOwner = this.faculty.find((f: IFaculty) => f.email === newOwnerEmail);
  if (newOwner) {
    newOwner.role = 'owner';
  }
  
  return this.save();
};

// Methods for rating and review management
CourseSchema.methods.addRating = function(rating: number) {
  if (rating >= 1 && rating <= 5) {
    this.ratings.push(rating);
    return this.save();
  }
  throw new Error('Rating must be between 1 and 5');
};

CourseSchema.methods.addReview = function(reviewId: mongoose.Types.ObjectId, rating?: number) {
  this.reviewIds.push(reviewId);
  if (rating && rating >= 1 && rating <= 5) {
    this.ratings.push(rating);
  }
  return this.save();
};

CourseSchema.methods.removeReview = function(reviewId: mongoose.Types.ObjectId, ratingIndex?: number) {
  this.reviewIds = this.reviewIds.filter((id: mongoose.Types.ObjectId) => !id.equals(reviewId));
  if (ratingIndex !== undefined && ratingIndex >= 0 && ratingIndex < this.ratings.length) {
    this.ratings.splice(ratingIndex, 1);
  }
  return this.save();
};

CourseSchema.methods.getRatingStats = function() {
  if (!this.ratings || this.ratings.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  this.ratings.forEach((rating: number) => {
    distribution[rating as keyof typeof distribution]++;
  });
  
  return {
    average: this.rating,
    total: this.ratings.length,
    distribution
  };
};

// Clear mongoose model cache if it exists
delete mongoose.models.Course;

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;