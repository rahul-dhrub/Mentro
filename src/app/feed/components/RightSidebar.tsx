'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiCalendar, FiClock, FiMessageSquare, FiSearch, FiSend } from 'react-icons/fi';

interface Class {
  id: string;
  title: string;
  time: string;
  room: string;
  students: number;
}

interface Message {
  id: string;
  sender: {
    name: string;
    avatar: string;
  };
  content: string;
  time: string;
  unread: boolean;
}

interface RightSidebarProps {
  upcomingClasses: Class[];
  messages: Message[];
}

export default function RightSidebar({ upcomingClasses, messages }: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6 w-80">
      {/* Upcoming Classes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
          <FiCalendar className="text-gray-400" size={20} />
        </div>
        <div className="space-y-4">
          {upcomingClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{classItem.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <FiClock className="mr-1" size={14} />
                    {classItem.time}
                  </div>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {classItem.students} students
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Room {classItem.room}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <FiMessageSquare className="text-gray-400" size={20} />
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 p-3 rounded-lg ${
                message.unread ? 'bg-blue-50' : 'hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={message.sender.avatar}
                  alt={message.sender.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{message.sender.name}</h3>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{message.content}</p>
              </div>
              {message.unread && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* Quick Message */}
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <button className="p-2 text-blue-600 hover:text-blue-700">
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
} 