import mongoose, { Schema, Document } from 'mongoose';

export interface ILessonContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'link' | 'pdf' | 'document';
  order: number;
}

export interface ILesson extends Document {
  _id: string;
  title: string;
  titleDescription?: string;
  description: string;
  duration: string;
  isPublished: boolean;
  isLive: boolean;
  chapterId: mongoose.Types.ObjectId;
  order: number;
  
  // Content and documents
  lessonContents: ILessonContent[];
  
  // Live lesson data
  liveScheduleDate?: string;
  liveScheduleTime?: string;
  liveScheduleLink?: string;
  timezone?: string;
  utcDateTime?: Date;
  
  // Assignments and quizzes
  assignments: mongoose.Types.ObjectId[];
  quizzes: mongoose.Types.ObjectId[];
  
  createdAt: Date;
  updatedAt: Date;
}

const LessonContentSchema = new Schema<ILessonContent>({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'image', 'link', 'pdf', 'document'],
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

const LessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '0 min',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    lessonContents: [LessonContentSchema],
    liveScheduleDate: {
      type: String,
    },
    liveScheduleTime: {
      type: String,
    },
    liveScheduleLink: {
      type: String,
    },
    timezone: {
      type: String,
    },
    utcDateTime: {
      type: Date,
    },
    assignments: [{
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
    }],
    quizzes: [{
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    }],
  },
  {
    timestamps: true,
    // Ensure all fields are included in JSON output
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
LessonSchema.index({ chapterId: 1 });
LessonSchema.index({ order: 1 });
LessonSchema.index({ isPublished: 1 });

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema); 