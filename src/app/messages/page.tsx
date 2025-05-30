'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import MessageSidebar from './components/MessageSidebar';
import ChatArea from './components/ChatArea';
import { Message, Conversation, User } from './types/messages';

// Mock data for demonstration
const mockConversations = [
  {
    id: '1',
    name: 'John Doe',
    lastMessage: 'Hey, how are you doing?',
    timestamp: '2:30 PM',
    unreadCount: 2,
    avatar: '/api/placeholder/40/40',
    online: true,
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    lastMessage: 'Thanks for the help with the project!',
    timestamp: '1:45 PM',
    unreadCount: 0,
    avatar: '/api/placeholder/40/40',
    online: false,
  },
  {
    id: '3',
    name: 'Mike Johnson',
    lastMessage: 'Can we schedule a meeting tomorrow?',
    timestamp: '12:20 PM',
    unreadCount: 1,
    avatar: '/api/placeholder/40/40',
    online: true,
  },
  {
    id: '4',
    name: 'Emily Davis',
    lastMessage: 'The documents are ready for review',
    timestamp: 'Yesterday',
    unreadCount: 0,
    avatar: '/api/placeholder/40/40',
    online: false,
  },
  {
    id: '5',
    name: 'Team Alpha',
    lastMessage: 'Meeting starts in 10 minutes',
    timestamp: 'Yesterday',
    unreadCount: 5,
    avatar: '/api/placeholder/40/40',
    online: false,
    isGroup: true,
  },
];

const mockMessages = {
  '1': [
    {
      id: '1',
      text: 'Hey, how are you doing?',
      timestamp: '2:30 PM',
      sender: 'John Doe',
      isOwn: false,
    },
    {
      id: '2',
      text: 'I\'m doing great! Thanks for asking. How about you?',
      timestamp: '2:31 PM',
      sender: 'You',
      isOwn: true,
    },
    {
      id: '3',
      text: 'Pretty good! Working on some exciting projects lately.',
      timestamp: '2:32 PM',
      sender: 'John Doe',
      isOwn: false,
    },
  ],
  '2': [
    {
      id: '1',
      text: 'Thanks for the help with the project!',
      timestamp: '1:45 PM',
      sender: 'Sarah Wilson',
      isOwn: false,
    },
    {
      id: '2',
      text: 'You\'re welcome! Happy to help anytime.',
      timestamp: '1:46 PM',
      sender: 'You',
      isOwn: true,
    },
  ],
  '3': [
    {
      id: '1',
      text: 'Can we schedule a meeting tomorrow?',
      timestamp: '12:20 PM',
      sender: 'Mike Johnson',
      isOwn: false,
    },
  ],
  '4': [
    {
      id: '1',
      text: 'The documents are ready for review',
      timestamp: 'Yesterday',
      sender: 'Emily Davis',
      isOwn: false,
    },
    {
      id: '2',
      text: 'Perfect! I\'ll take a look at them this afternoon.',
      timestamp: 'Yesterday',
      sender: 'You',
      isOwn: true,
    },
  ],
  '5': [
    {
      id: '1',
      text: 'Meeting starts in 10 minutes',
      timestamp: 'Yesterday',
      sender: 'Team Alpha',
      isOwn: false,
    },
    {
      id: '2',
      text: 'On my way!',
      timestamp: 'Yesterday',
      sender: 'You',
      isOwn: true,
    },
  ],
};

export default function MessagesPage() {
  const { user, isLoaded } = useUser();
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [conversations] = useState(mockConversations);
  const [messages] = useState(mockMessages);

  // Show loading state while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="flex h-full w-full bg-gray-100 overflow-hidden items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if user is not authenticated
  if (!user) {
    return (
      <div className="flex h-full w-full bg-gray-100 overflow-hidden items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please sign in</h3>
          <p className="text-gray-600">You need to be signed in to access messages</p>
        </div>
      </div>
    );
  }

  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);
  const selectedMessages = selectedConversation ? messages[selectedConversation as keyof typeof messages] || [] : [];

  // User data from Clerk
  const userData = {
    id: user.id,
    username: user.username || user.firstName || 'User',
    email: user.primaryEmailAddress?.emailAddress || '',
    imageUrl: user.imageUrl || '',
    fullName: user.fullName || user.username || 'User'
  };

  return (
    <div className="flex h-full w-full bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <MessageSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        currentUser={userData}
      />
      
      {/* Main Chat Area */}
      <ChatArea
        conversation={selectedConversationData}
        messages={selectedMessages}
        currentUser={userData}
        onSendMessage={(message: string) => {
          // Handle sending message
          console.log('Sending message:', message);
        }}
      />
    </div>
  );
} 