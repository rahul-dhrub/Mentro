import mongoose, { Schema, Document } from 'mongoose';

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  date: string;
  location?: string;
  attendees?: number;
  description?: string;
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    trim: true
  },
  attendees: {
    type: Number,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
ScheduleSchema.index({ userId: 1, date: 1, startTime: 1 });

const Schedule = mongoose.models.Schedule || mongoose.model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule; 