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
  instructor: {
    name: string;
    image?: string;
    rating?: number;
    reviews?: number;
  };
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
  rating: number;
  reviews: number;
  
  // Timestamps
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
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
    instructor: {
      name: {
        type: String,
        required: true,
      },
      image: String,
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviews: {
        type: Number,
        default: 0,
      },
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
    reviews: {
      type: Number,
      default: 0,
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

// Pre-save middleware to update totalStudents
CourseSchema.pre('save', function(this: ICourse, next) {
  this.totalStudents = this.students.length;
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

// Clear mongoose model cache if it exists
delete mongoose.models.Course;

const Course = mongoose.model<ICourse>('Course', CourseSchema);

export default Course;