import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface IAssignment extends Document {
  _id: string;
  title: string;
  description: string;
  content: string;
  dueDate: Date;
  totalMarks: number;
  submissions: number;
  attachments: IAttachment[];
  courseId: string;
  lessonId?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const AssignmentSchema = new Schema<IAssignment>(
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
    content: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    submissions: {
      type: Number,
      default: 0,
    },
    attachments: [AttachmentSchema],
    courseId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
    },
    isPublished: {
      type: Boolean,
      default: false,
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

// Indexes
AssignmentSchema.index({ courseId: 1 });
AssignmentSchema.index({ lessonId: 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ createdBy: 1 });

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema); 