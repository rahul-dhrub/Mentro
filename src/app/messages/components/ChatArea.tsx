'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiPhone, FiVideo, FiMoreVertical, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { Message, Conversation, User } from '../types/messages';

interface ChatAreaProps {
  conversation: Conversation | undefined;
  messages: Message[];
  currentUser: User;
  loading?: boolean;
  onSendMessage: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export default function ChatArea({ 
  conversation, 
  messages, 
  currentUser, 
  loading = false, 
  onSendMessage,
  onDeleteMessage,
  onDeleteConversation
}: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: 'message' | 'conversation';
    id: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  const messageMenuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setShowChatMenu(false);
      }
      
      // Check message menus
      const clickedOutsideMessageMenu = Object.values(messageMenuRefs.current).every(
        ref => !ref || !ref.contains(event.target as Node)
      );
      
      if (clickedOutsideMessageMenu) {
        setShowMessageMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch('/api/messages/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // Call the parent handler to update the UI
      if (onDeleteMessage) {
        onDeleteMessage(messageId);
      }
      
      setShowDeleteConfirm(null);
      setShowMessageMenu(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message. Please try again.');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch('/api/messages/conversation/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Call the parent handler to update the UI
      if (onDeleteConversation) {
        onDeleteConversation(conversationId);
      }
      
      setShowDeleteConfirm(null);
      setShowChatMenu(false);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {conversation.isGroup ? (
                  <span className="text-sm">👥</span>
                ) : (
                  conversation.name.charAt(0).toUpperCase()
                )}
              </div>
              {conversation.online && !conversation.isGroup && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            
            {/* Name and Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{conversation.name}</h2>
              <p className="text-sm text-gray-500">
                {conversation.isGroup ? 'Group chat' : conversation.online ? 'Online' : 'Last seen recently'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <FiPhone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <FiVideo className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative" ref={chatMenuRef}>
              <button 
                onClick={() => setShowChatMenu(!showChatMenu)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiMoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Chat Menu Dropdown */}
              {showChatMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm({ type: 'conversation', id: conversation.id });
                      setShowChatMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete Conversation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-gray-500">No messages yet</p>
              <p className="text-gray-400 text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end space-x-2 ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar for received messages */}
              {!message.isOwn && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {message.sender.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="relative group">
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                    message.isOwn
                      ? 'bg-blue-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {!message.isOwn && (
                    <p className="text-xs font-medium text-gray-600 mb-1">{message.sender}</p>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p
                    className={`text-xs mt-2 ${
                      message.isOwn ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>

                {/* Message Menu - Only for own messages */}
                {message.isOwn && (
                  <div className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative" ref={(el) => { messageMenuRefs.current[message.id] = el; }}>
                      <button
                        onClick={() => setShowMessageMenu(showMessageMenu === message.id ? null : message.id)}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <FiMoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      
                      {/* Message Menu Dropdown */}
                      {showMessageMenu === message.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <button
                            onClick={() => {
                              setShowDeleteConfirm({ type: 'message', id: message.id });
                              setShowMessageMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <FiTrash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar for sent messages */}
              {message.isOwn && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {currentUser.imageUrl ? (
                    <img 
                      src={currentUser.imageUrl} 
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-xs">
                      {currentUser.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-3">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
            {currentUser.imageUrl ? (
              <img 
                src={currentUser.imageUrl} 
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Input Container */}
          <div className="flex-1 flex items-end space-x-2">
            {/* Attachment Button */}
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiPaperclip className="w-5 h-5 text-gray-600" />
            </button>

            {/* Message Input */}
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm font-medium"
                style={{ 
                  minHeight: '44px', 
                  maxHeight: '120px',
                  color: '#1f2937',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              />
              
              {/* Emoji Button */}
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors">
                <FiSmile className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`p-3 rounded-full transition-all duration-200 ${
                newMessage.trim()
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FiSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {showDeleteConfirm.type === 'message' ? 'Delete Message' : 'Delete Conversation'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {showDeleteConfirm.type === 'message' 
                      ? 'This message will be permanently deleted.' 
                      : 'All messages in this conversation will be permanently deleted.'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (showDeleteConfirm.type === 'message') {
                      handleDeleteMessage(showDeleteConfirm.id);
                    } else {
                      handleDeleteConversation(showDeleteConfirm.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 