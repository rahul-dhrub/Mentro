'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';
import MessageSidebar from './components/MessageSidebar';
import ChatArea from './components/ChatArea';
import NewConversationModal from './components/NewConversationModal';
import { Message, Conversation, User } from './types/messages';

export default function MessagesPage() {
  const { user, isLoaded } = useUser();

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

  // Now we can safely use hooks since we know user is loaded and authenticated
  return <MessagesPageContent user={user} />;
}

function MessagesPageContent({ user }: { user: UserResource }) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);

  // User data from Clerk
  const userData = {
    id: user.id,
    username: user.username || user.firstName || 'User',
    email: user.primaryEmailAddress?.emailAddress || '',
    imageUrl: user.imageUrl || '',
    fullName: user.fullName || user.username || 'User'
  };

  // Fetch conversations from API
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages/conversations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      const data = await response.json();
      
      // Transform API response to match our Conversation interface
      const transformedConversations: Conversation[] = data.conversations.map((conv: any) => ({
        id: conv.conversationId,
        name: conv.otherUser.name,
        lastMessage: conv.lastMessage.text,
        timestamp: new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        unreadCount: conv.unreadCount,
        avatar: conv.otherUser.profilePicture || '',
        online: false, // We don't have online status from API yet
        isGroup: false,
        email: conv.otherUser.email,
      }));
      
      setConversations(transformedConversations);
      
      // Auto-select first conversation if none selected
      if (transformedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(transformedConversations[0].id);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/messages/conversation/${conversationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      // Transform API response to match our Message interface
      const transformedMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        timestamp: new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sender: msg.isOwn ? userData.fullName : getOtherUserName(conversationId),
        isOwn: msg.isOwn,
      }));
      
      setMessages(transformedMessages);
      
      // Mark messages as read
      if (transformedMessages.length > 0) {
        markMessagesAsRead(conversationId);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  // Get other user's name from conversation ID
  const getOtherUserName = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    return conversation?.name || 'Unknown User';
  };

  // Send a message
  const handleSendMessage = async (messageText: string) => {
    if (!selectedConversation || !messageText.trim()) return;

    const conversation = conversations.find(conv => conv.id === selectedConversation);
    if (!conversation) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverEmail: conversation.email,
          text: messageText.trim(),
          messageType: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add the new message to the current messages
      const newMessage: Message = {
        id: data.data.id,
        text: messageText.trim(),
        timestamp: new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        sender: userData.fullName,
        isOwn: true,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update the conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, lastMessage: messageText.trim(), timestamp: newMessage.timestamp }
          : conv
      ));
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await fetch('/api/messages/mark-read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
        }),
      });
      
      // Update unread count in conversations
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  // Handle starting a new conversation
  const handleStartNewConversation = async (userEmail: string, userName: string) => {
    try {
      // Create a conversation ID based on emails (always currentUser_otherUser format)
      const normalizedUserEmail = userData.email.toLowerCase();
      const normalizedOtherEmail = userEmail.toLowerCase();
      const conversationId = `${normalizedUserEmail}_${normalizedOtherEmail}`;
      
      // Check if conversation already exists (only look for userEmail_receiverEmail format)
      const existingConversation = conversations.find(conv => conv.id === conversationId);
      
      if (existingConversation) {
        // If conversation exists, just select it
        setSelectedConversation(existingConversation.id);
        fetchMessages(existingConversation.id);
      } else {
        // Create a new conversation entry locally
        const newConversation: Conversation = {
          id: conversationId,
          name: userName,
          lastMessage: '',
          timestamp: '',
          unreadCount: 0,
          avatar: '',
          online: false,
          isGroup: false,
          email: userEmail,
        };
        
        // Add to conversations list
        setConversations(prev => [newConversation, ...prev]);
        
        // Select the new conversation
        setSelectedConversation(conversationId);
        setMessages([]); // Start with empty messages
      }
    } catch (err) {
      console.error('Error starting new conversation:', err);
      setError('Failed to start new conversation');
    }
  };

  // Handle deleting a message
  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  // Handle deleting a conversation
  const handleDeleteConversation = (conversationId: string) => {
    // Remove conversation from list
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // If this was the selected conversation, clear selection
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setMessages([]);
    }
  };

  // Fetch conversations on component mount
  useEffect(() => {
    if (userData.email) {
      fetchConversations();
    }
  }, [userData.email]);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);

  if (loading) {
    return (
      <div className="flex h-full w-full bg-gray-100 overflow-hidden items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full bg-gray-100 overflow-hidden items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchConversations();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full w-full bg-gray-100 overflow-hidden">
        {/* Sidebar */}
        <MessageSidebar
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          onNewConversation={() => setShowNewConversationModal(true)}
          currentUser={userData}
        />
        
        {/* Main Chat Area */}
        <ChatArea
          conversation={selectedConversationData}
          messages={messages}
          currentUser={userData}
          loading={messagesLoading}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          onDeleteConversation={handleDeleteConversation}
        />
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onStartConversation={handleStartNewConversation}
        currentUserEmail={userData.email}
      />
    </>
  );
} 