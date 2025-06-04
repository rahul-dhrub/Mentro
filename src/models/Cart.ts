import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  thumbnail: string;
  instructor: {
    name: string;
    image: string;
    rating: number;
    reviews: number;
  };
  rating: number;
  reviews: number;
  students: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  lastUpdated: Date;
  features: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  curriculum: any[];
  addedAt: Date;
}

export interface ICart extends Document {
  userId: string;
  items: ICartItem[];
  totalItems: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  thumbnail: { type: String, required: true },
  instructor: {
    name: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 }
  },
  rating: { type: Number, required: true },
  reviews: { type: Number, default: 0 },
  students: { type: Number, required: true },
  category: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    required: true 
  },
  duration: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
  features: [{ type: String }],
  requirements: [{ type: String }],
  whatYouWillLearn: [{ type: String }],
  curriculum: [{ type: Schema.Types.Mixed }],
  addedAt: { type: Date, default: Date.now }
});

const CartSchema = new Schema<ICart>({
  userId: { type: String, required: true, unique: true },
  items: [CartItemSchema],
  totalItems: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update totals before saving
CartSchema.pre('save', function(next) {
  this.totalItems = this.items.length;
  this.totalAmount = this.items.reduce((sum, item) => sum + item.price, 0);
  this.updatedAt = new Date();
  next();
});

// Prevent duplicate items
CartSchema.index({ userId: 1, 'items.courseId': 1 });

export default mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema); 