'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip, FiSmile, FiPhone, FiVideo, FiMoreVertical } from 'react-icons/fi';
import { Message, Conversation, User } from '../types/messages';

interface ChatAreaProps {
  conversation: Conversation | undefined;
  messages: Message[];
  currentUser: User;
  onSendMessage: (message: string) => void;
}

export default function ChatArea({ conversation, messages, currentUser, onSendMessage }: ChatAreaProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <FiMoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
        {messages.map((message) => (
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
        ))}
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
    </div>
  );
} 