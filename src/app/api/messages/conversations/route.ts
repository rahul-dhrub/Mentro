import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export async function GET(req: NextRequest) {
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

    const normalizedUserEmail = userEmail.toLowerCase();

    // Find all unique conversations where the user is the sender only
    // We only look for conversationId format: userEmail_receiverEmail
    const conversations = await Message.aggregate([
      {
        // Match messages where user is the sender AND conversation follows userEmail_receiverEmail format
        $match: {
          senderEmail: normalizedUserEmail,
          conversationId: { $regex: `^${normalizedUserEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}_` }
        }
      },
      {
        // Sort by timestamp to get latest messages first
        $sort: { timestamp: -1 }
      },
      {
        // Group by conversation ID and get the latest message
        $group: {
          _id: '$conversationId',
          latestMessage: { $first: '$$ROOT' }
        }
      },
      {
        // Sort conversations by latest message timestamp
        $sort: { 'latestMessage.timestamp': -1 }
      }
    ]);

    // Get receiver emails from conversations (the part after the underscore)
    const receiverEmails = new Set<string>();
    conversations.forEach(conv => {
      const conversationId = conv._id;
      const parts = conversationId.split('_');
      if (parts.length === 2) {
        receiverEmails.add(parts[1]); // Get the receiver email part
      }
    });

    // Calculate unread counts for each conversation
    // We need to check the reverse conversation (receiverEmail_userEmail) for unread messages
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const conversationId = conv._id;
        const parts = conversationId.split('_');
        const receiverEmail = parts[1];
        
        // Check for unread messages in the reverse conversation
        const reverseConversationId = `${receiverEmail}_${normalizedUserEmail}`;
        const unreadCount = await Message.countDocuments({
          conversationId: reverseConversationId,
          receiverEmail: normalizedUserEmail,
          isRead: false
        });

        return {
          ...conv,
          unreadCount
        };
      })
    );

    // Fetch user details for other participants
    const otherUsers = await User.find({
      email: { $in: Array.from(receiverEmails) }
    }).lean();

    // Create a map for quick user lookup
    const userMap = new Map();
    otherUsers.forEach(user => {
      userMap.set(user.email.toLowerCase(), user);
    });

    // Format conversations for response
    const formattedConversations = conversationsWithUnread.map(conv => {
      const { latestMessage, unreadCount } = conv;
      const otherUserEmail = latestMessage.receiverEmail;
      
      const otherUser = userMap.get(otherUserEmail);
      
      return {
        id: conv._id,
        conversationId: conv._id,
        otherUser: {
          email: otherUserEmail,
          name: otherUser?.name || 'Unknown User',
          profilePicture: otherUser?.profilePicture || '',
        },
        lastMessage: {
          id: latestMessage._id,
          text: latestMessage.text,
          timestamp: latestMessage.timestamp,
          senderEmail: latestMessage.senderEmail,
          isOwn: latestMessage.senderEmail === normalizedUserEmail,
        },
        unreadCount,
        updatedAt: latestMessage.timestamp,
      };
    });

    return NextResponse.json(
      {
        conversations: formattedConversations,
        total: formattedConversations.length,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 