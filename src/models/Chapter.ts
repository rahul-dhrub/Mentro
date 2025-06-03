import mongoose, { Schema, Document } from 'mongoose';

export interface IChapter extends Document {
  _id: string;
  title: string;
  description: string;
  duration: string;
  isPublished: boolean;
  lessons: mongoose.Types.ObjectId[]; // Array of lesson IDs
  courseId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>(
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
    duration: {
      type: String,
      default: '0 min',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    lessons: [{
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    }],
    courseId: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ChapterSchema.index({ courseId: 1 });
ChapterSchema.index({ order: 1 });

export default mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema); 