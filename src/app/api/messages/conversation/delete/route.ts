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
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Validate conversation ID format (should be useremail_receiveremail)
    if (!conversationId.includes('_')) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Extract emails from conversation ID
    const [senderEmail, receiverEmail] = conversationId.split('_');
    const normalizedUserEmail = userEmail.toLowerCase();
    
    // Verify that the current user is part of this conversation
    if (senderEmail !== normalizedUserEmail && receiverEmail !== normalizedUserEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - You are not part of this conversation' },
        { status: 403 }
      );
    }

    // Delete all messages in this conversation
    const deleteResult = await Message.deleteMany({ conversationId });

    return NextResponse.json(
      { 
        message: 'Conversation deleted successfully',
        deletedCount: deleteResult.deletedCount
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 