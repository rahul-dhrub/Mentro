import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export async function DELETE(req: NextRequest) {
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
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Find the message and verify ownership
    const message = await Message.findById(messageId);
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Check if the user is the sender of the message
    if (message.senderEmail !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own messages' },
        { status: 403 }
      );
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    return NextResponse.json(
      { message: 'Message deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 