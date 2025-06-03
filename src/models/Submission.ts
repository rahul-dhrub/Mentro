import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmissionAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ISubmission extends Document {
  _id: string;
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  notes?: string;
  attachments: ISubmissionAttachment[];
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionAttachmentSchema = new Schema<ISubmissionAttachment>({
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

const SubmissionSchema = new Schema<ISubmission>(
  {
    assignmentId: {
      type: String,
      required: true,
      ref: 'Assignment',
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
    },
    notes: {
      type: String,
    },
    attachments: [SubmissionAttachmentSchema],
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late'],
      default: 'submitted',
    },
    grade: {
      type: Number,
      min: 0,
    },
    feedback: {
      type: String,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    gradedAt: {
      type: Date,
    },
    gradedBy: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubmissionSchema.index({ assignmentId: 1 });
SubmissionSchema.index({ userId: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ submittedAt: 1 });
SubmissionSchema.index({ assignmentId: 1, userId: 1 }, { unique: true }); // One submission per user per assignment

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema); 