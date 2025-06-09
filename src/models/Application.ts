import mongoose from 'mongoose';

export interface IApplication extends mongoose.Document {
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  applicantName: string;
  applicantEmail: string;
  mobileNumber?: string;
  
  // Application data
  resumeUrl: string; // Required for easy apply
  coverLetter?: string; // Optional
  customAnswers: {
    questionId: string;
    question: string;
    answer: string | string[]; // string for text/textarea, array for multiselect
  }[];
  
  // Status tracking
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  notes?: string; // Recruiter notes
  
  // Email confirmation
  emailConfirmed: boolean;
  confirmationToken?: string;
  confirmationSentAt?: Date;
  
  // Timestamps
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new mongoose.Schema<IApplication>(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true,
      maxlength: [100, 'Applicant name cannot exceed 100 characters'],
    },
    applicantEmail: {
      type: String,
      required: [true, 'Applicant email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    mobileNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Mobile number cannot exceed 20 characters'],
    },
    
    // Application data
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required'],
      trim: true,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters'],
    },
    customAnswers: [{
      questionId: {
        type: String,
        required: true,
      },
      question: {
        type: String,
        required: true,
        trim: true,
      },
      answer: {
        type: mongoose.Schema.Types.Mixed, // Can be string or array
        required: true,
      },
    }],
    
    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    
    // Email confirmation
    emailConfirmed: {
      type: Boolean,
      default: false,
    },
    confirmationToken: {
      type: String,
    },
    confirmationSentAt: {
      type: Date,
    },
    
    // Timestamps
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
applicationSchema.index({ jobId: 1, appliedAt: -1 });
applicationSchema.index({ applicantId: 1, appliedAt: -1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ emailConfirmed: 1 });
applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true }); // Prevent duplicate applications

// Instance methods
applicationSchema.methods.updateStatus = function(status: string, reviewerId?: mongoose.Types.ObjectId, notes?: string) {
  this.status = status;
  if (reviewerId) {
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
  }
  if (notes) {
    this.notes = notes;
  }
  return this.save();
};

applicationSchema.methods.confirmEmail = function() {
  this.emailConfirmed = true;
  this.confirmationToken = undefined;
  return this.save();
};

// Clear mongoose model cache if it exists
delete mongoose.models.Application;

const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', applicationSchema);

export default Application; 