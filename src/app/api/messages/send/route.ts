import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get the current user's email from Clerk
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const body = await req.json();
    const { receiverEmail, text, messageType = 'text' } = body;

    // Validate required fields
    if (!receiverEmail || !text) {
      return NextResponse.json(
        { error: 'Receiver email and message text are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail)) {
      return NextResponse.json(
        { error: 'Invalid receiver email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (text.length > 2000) {
      return NextResponse.json(
        { error: 'Message cannot be more than 2000 characters' },
        { status: 400 }
      );
    }

    // Prevent sending message to self
    if (userEmail.toLowerCase() === receiverEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      );
    }

    // Create timestamp
    const timestamp = new Date();

    // Normalize emails to lowercase
    const normalizedUserEmail = userEmail.toLowerCase();
    const normalizedReceiverEmail = receiverEmail.toLowerCase();

    // Create conversation IDs for dual storage
    const conversationId1 = `${normalizedUserEmail}_${normalizedReceiverEmail}`;
    const conversationId2 = `${normalizedReceiverEmail}_${normalizedUserEmail}`;

    // Prepare message data
    const messageData = {
      senderEmail: normalizedUserEmail,
      receiverEmail: normalizedReceiverEmail,
      text: text.trim(),
      timestamp,
      messageType,
      isRead: false,
    };

    // Store message twice with different conversation IDs
    const message1 = await Message.create({
      ...messageData,
      conversationId: conversationId1,
    });

    const message2 = await Message.create({
      ...messageData,
      conversationId: conversationId2,
    });

    // Return the message data (using the first one as reference)
    const responseMessage = {
      id: message1._id,
      conversationId: conversationId1,
      senderEmail: normalizedUserEmail,
      receiverEmail: normalizedReceiverEmail,
      text: text.trim(),
      timestamp,
      messageType,
      isRead: false,
    };

    return NextResponse.json(
      { 
        message: 'Message sent successfully', 
        data: responseMessage,
        stored: {
          conversation1: conversationId1,
          conversation2: conversationId2,
        }
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 