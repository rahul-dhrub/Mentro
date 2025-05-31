import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
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
    
    const { conversationId } = await params;
    
    // Validate conversation ID format (should be useremail_receiveremail)
    if (!conversationId || !conversationId.includes('_')) {
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

    // Get query parameters for pagination and timestamp filtering
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const since = url.searchParams.get('since');
    const skip = (page - 1) * limit;

    // Build query filter
    let messageFilter: any = { conversationId };
    
    // Add timestamp filter if 'since' parameter is provided
    if (since) {
      try {
        const sinceDate = new Date(since);
        messageFilter.timestamp = { $gt: sinceDate };
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid since timestamp format' },
          { status: 400 }
        );
      }
    }

    // Fetch messages for this conversation (sorted by timestamp, newest first)
    const messages = await Message.find(messageFilter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalMessages = await Message.countDocuments(messageFilter);
    const totalPages = Math.ceil(totalMessages / limit);

    // Format messages for response
    const formattedMessages = messages.reverse().map(message => ({
      id: message._id,
      text: message.text,
      senderEmail: message.senderEmail,
      receiverEmail: message.receiverEmail,
      timestamp: message.timestamp,
      isRead: message.isRead,
      messageType: message.messageType,
      isOwn: message.senderEmail === normalizedUserEmail,
    }));

    return NextResponse.json(
      {
        messages: formattedMessages,
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        conversationId,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 