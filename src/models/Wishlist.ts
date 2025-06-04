import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  instructor: {
    name: string;
    avatar: string;
  };
  rating: number;
  studentsCount: number;
  category: string;
  level: string;
  duration: string;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: string;
  items: IWishlistItem[];
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema<IWishlistItem>({
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  thumbnail: { type: String, required: true },
  instructor: {
    name: { type: String, required: true },
    avatar: { type: String, required: true }
  },
  rating: { type: Number, required: true },
  studentsCount: { type: Number, required: true },
  category: { type: String, required: true },
  level: { type: String, required: true },
  duration: { type: String, required: true },
  addedAt: { type: Date, default: Date.now }
});

const WishlistSchema = new Schema<IWishlist>({
  userId: { type: String, required: true, unique: true },
  items: [WishlistItemSchema],
  totalItems: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update totals before saving
WishlistSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.updatedAt = new Date();
  next();
});

// Prevent duplicate items
WishlistSchema.index({ userId: 1, 'items.courseId': 1 });

export default mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema); 