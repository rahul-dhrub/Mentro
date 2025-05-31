import mongoose from 'mongoose';

export interface IMessage extends mongoose.Document {
  conversationId: string; // Format: "useremail_receiveremail" or "receiveremail_useremail"
  senderEmail: string;
  receiverEmail: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: [true, 'Conversation ID is required'],
      index: true, // Index for faster queries
    },
    senderEmail: {
      type: String,
      required: [true, 'Sender email is required'],
      index: true,
      lowercase: true,
      trim: true,
    },
    receiverEmail: {
      type: String,
      required: [true, 'Receiver email is required'],
      index: true,
      lowercase: true,
      trim: true,
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [2000, 'Message cannot be more than 2000 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient conversation queries
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ senderEmail: 1, receiverEmail: 1, timestamp: -1 });

const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message; 