import mongoose from 'mongoose';

export interface IPublication extends mongoose.Document {
  title: string;
  url: string;
  thumbnail?: string;
  journal?: string;
  year?: number;
  authors: string[];
  citationCount?: number;
  abstract?: string;
  userId: mongoose.Types.ObjectId; // Reference to the user who owns this publication
  createdAt: Date;
  updatedAt: Date;
}

const publicationSchema = new mongoose.Schema<IPublication>(
  {
    title: {
      type: String,
      required: [true, 'Publication title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    url: {
      type: String,
      required: [true, 'Publication URL is required'],
      trim: true,
      validate: {
        validator: function(v: string) {
          // More flexible URL validation
          const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
          return urlPattern.test(v) || /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL (e.g., example.com or https://example.com)'
      }
    },
    thumbnail: {
      type: String,
      default: '',
    },
    journal: {
      type: String,
      trim: true,
      maxlength: [100, 'Journal name cannot be more than 100 characters'],
    },
    year: {
      type: Number,
      min: [1900, 'Year must be after 1900'],
      max: [new Date().getFullYear(), 'Year cannot be in the future'],
    },
    authors: [{
      type: String,
      trim: true,
      maxlength: [100, 'Author name cannot be more than 100 characters'],
    }],
    citationCount: {
      type: Number,
      default: 0,
      min: [0, 'Citation count cannot be negative'],
    },
    abstract: {
      type: String,
      trim: true,
      maxlength: [1000, 'Abstract cannot be more than 1000 characters'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
publicationSchema.index({ userId: 1 });
publicationSchema.index({ year: -1 });
publicationSchema.index({ citationCount: -1 });

// Clear mongoose model cache if it exists
delete mongoose.models.Publication;

const Publication = mongoose.models.Publication || mongoose.model<IPublication>('Publication', publicationSchema);

export default Publication; 