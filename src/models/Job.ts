import mongoose from 'mongoose';

export interface IJob extends mongoose.Document {
  title: string;
  company: string;
  location: string;
  workType: 'remote' | 'onsite' | 'hybrid';
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship';
  description: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  categories: string[]; // Tagged categories
  skills: string[];
  experience: {
    min: number;
    max: number;
  };
  
  // Application settings
  easyApply: boolean;
  externalLink?: string; // For non-easy apply
  customQuestions: {
    question: string;
    required: boolean;
    type: 'text' | 'textarea' | 'select' | 'multiselect';
    options?: string[]; // For select/multiselect
  }[];
  
  // Recruiter info
  recruiterId: mongoose.Types.ObjectId;
  recruiterName: string;
  recruiterEmail: string;
  
  // Job status
  status: 'active' | 'closed' | 'draft';
  applications: mongoose.Types.ObjectId[]; // Application IDs
  totalApplications: number;
  
  // Timestamps
  postedDate: Date;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new mongoose.Schema<IJob>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    workType: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      required: [true, 'Work type is required'],
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: [true, 'Employment type is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    requirements: [{
      type: String,
      trim: true,
      maxlength: [500, 'Requirement cannot exceed 500 characters'],
    }],
    responsibilities: [{
      type: String,
      trim: true,
      maxlength: [500, 'Responsibility cannot exceed 500 characters'],
    }],
    salaryRange: {
      min: {
        type: Number,
        min: [0, 'Minimum salary cannot be negative'],
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary cannot be negative'],
      },
      currency: {
        type: String,
        default: 'USD',
        maxlength: [3, 'Currency code cannot exceed 3 characters'],
      },
    },
    categories: [{
      type: String,
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    }],
    skills: [{
      type: String,
      trim: true,
      maxlength: [50, 'Skill cannot exceed 50 characters'],
    }],
    experience: {
      min: {
        type: Number,
        min: [0, 'Minimum experience cannot be negative'],
        default: 0,
      },
      max: {
        type: Number,
        min: [0, 'Maximum experience cannot be negative'],
        default: 10,
      },
    },
    
    // Application settings
    easyApply: {
      type: Boolean,
      default: true,
    },
    externalLink: {
      type: String,
      trim: true,
      validate: {
        validator: function(this: IJob, v: string) {
          // Only validate if easyApply is false and externalLink is provided
          if (!this.easyApply && v) {
            const urlRegex = /^https?:\/\/.+/;
            return urlRegex.test(v);
          }
          return true;
        },
        message: 'External link must be a valid URL',
      },
    },
    customQuestions: [{
      question: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Question cannot exceed 500 characters'],
      },
      required: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ['text', 'textarea', 'select', 'multiselect'],
        default: 'text',
      },
      options: [{
        type: String,
        trim: true,
        maxlength: [100, 'Option cannot exceed 100 characters'],
      }],
    }],
    
    // Recruiter info
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
    },
    recruiterName: {
      type: String,
      required: [true, 'Recruiter name is required'],
      trim: true,
    },
    recruiterEmail: {
      type: String,
      required: [true, 'Recruiter email is required'],
      trim: true,
      lowercase: true,
    },
    
    // Job status
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    applications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
    }],
    totalApplications: {
      type: Number,
      default: 0,
    },
    
    // Timestamps
    postedDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
jobSchema.index({ status: 1, postedDate: -1 });
jobSchema.index({ categories: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ workType: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

// Instance methods
jobSchema.methods.addApplication = function(applicationId: mongoose.Types.ObjectId) {
  if (!this.applications.includes(applicationId)) {
    this.applications.push(applicationId);
    this.totalApplications = this.applications.length;
    return this.save();
  }
  return this;
};

jobSchema.methods.removeApplication = function(applicationId: mongoose.Types.ObjectId) {
  this.applications = this.applications.filter((id: mongoose.Types.ObjectId) => !id.equals(applicationId));
  this.totalApplications = this.applications.length;
  return this.save();
};

// Clear mongoose model cache if it exists
delete mongoose.models.Job;

const Job = mongoose.models.Job || mongoose.model<IJob>('Job', jobSchema);

export default Job; 