import mongoose from 'mongoose';

export interface ISearchHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  resultType: 'user' | 'hashtag';
  resultId?: string;
  resultName?: string;
  clicked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const searchHistorySchema = new mongoose.Schema<ISearchHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    query: {
      type: String,
      required: [true, 'Search query is required'],
      trim: true,
      maxlength: [100, 'Query cannot be more than 100 characters'],
    },
    resultType: {
      type: String,
      enum: ['user', 'hashtag'],
      required: [true, 'Result type is required'],
    },
    resultId: {
      type: String,
      trim: true,
    },
    resultName: {
      type: String,
      trim: true,
    },
    clicked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
searchHistorySchema.index({ userId: 1, createdAt: -1 });
searchHistorySchema.index({ query: 1 });
searchHistorySchema.index({ resultType: 1 });
searchHistorySchema.index({ clicked: 1 });

// Clear mongoose model cache if it exists
delete mongoose.models.SearchHistory;

const SearchHistory = mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);

export default SearchHistory; 