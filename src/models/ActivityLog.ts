import mongoose from 'mongoose';

export interface IActivityLog extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  userName: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const activityLogSchema = new mongoose.Schema<IActivityLog>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login',
        'logout',
        'course_create',
        'course_update',
        'course_delete',
        'lesson_create',
        'lesson_update',
        'lesson_delete',
        'quiz_create',
        'quiz_update',
        'quiz_delete',
        'assignment_create',
        'assignment_update',
        'assignment_delete',
        'blog_create',
        'blog_update',
        'blog_delete',
        'post_create',
        'post_update',
        'post_delete',
        'comment_create',
        'message_send',
        'file_upload',
        'profile_update',
        'other'
      ],
    },
    resourceType: {
      type: String,
      enum: ['course', 'lesson', 'quiz', 'assignment', 'blog', 'post', 'comment', 'message', 'file', 'user'],
    },
    resourceId: {
      type: String,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);

export default ActivityLog; 