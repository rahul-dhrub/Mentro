import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonProgress extends Document {
  _id: string;
  userId: string; // Student ID
  userEmail: string; // Student email
  courseId: string;
  chapterId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: Date;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    userId: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    completedAt: {
      type: Date,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better performance
LessonProgressSchema.index({ userId: 1, courseId: 1 });
LessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
LessonProgressSchema.index({ courseId: 1, chapterId: 1 });
LessonProgressSchema.index({ lessonId: 1 });

// Pre-save middleware to set completedAt when status changes to completed
LessonProgressSchema.pre('save', function(this: ILessonProgress, next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = undefined;
    }
  }
  next();
});

const LessonProgress = mongoose.models.LessonProgress || mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);

export default LessonProgress; 