import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export async function PATCH(req: NextRequest) {
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
    const { conversationId, messageIds } = body;

    // Validate required fields
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Validate conversation ID format
    if (!conversationId.includes('_')) {
      return NextResponse.json(
        { error: 'Invalid conversation ID format' },
        { status: 400 }
      );
    }

    // Extract emails from conversation ID
    const [senderEmail, receiverEmail] = conversationId.split('_');
    const normalizedUserEmail = userEmail.toLowerCase();
    
    // Verify that the current user is the sender in this conversation format
    if (senderEmail !== normalizedUserEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid conversation format' },
        { status: 403 }
      );
    }

    // The messages to mark as read are in the reverse conversation
    // where the current user is the receiver
    const reverseConversationId = `${receiverEmail}_${normalizedUserEmail}`;

    let updateResult;

    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      // Mark specific messages as read in the reverse conversation
      updateResult = await Message.updateMany(
        {
          _id: { $in: messageIds },
          conversationId: reverseConversationId,
          receiverEmail: normalizedUserEmail, // Only mark messages received by current user
          isRead: false,
        },
        {
          $set: { isRead: true }
        }
      );
    } else {
      // Mark all unread messages in the reverse conversation as read
      updateResult = await Message.updateMany(
        {
          conversationId: reverseConversationId,
          receiverEmail: normalizedUserEmail, // Only mark messages received by current user
          isRead: false,
        },
        {
          $set: { isRead: true }
        }
      );
    }

    return NextResponse.json(
      {
        message: 'Messages marked as read successfully',
        updatedCount: updateResult.modifiedCount,
        conversationId,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 