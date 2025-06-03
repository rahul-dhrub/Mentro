import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  clerkId: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  title?: string;
  department?: string;
  role: 'admin' | 'instructor' | 'student';
  isOnline: boolean;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
      default: '',
    },
    title: {
      type: String,
      default: 'Faculty Member',
    },
    department: {
      type: String,
      default: 'Computer Science',
    },
    role: {
      type: String,
      enum: ['admin', 'instructor', 'student'],
      default: 'admin',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User; 