'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiCalendar, FiClock, FiMessageSquare, FiSearch, FiSend, FiExternalLink } from 'react-icons/fi';
import { scheduleAPI } from '@/lib/api/schedule';
import { ScheduleTask } from '@/app/schedule/types';

interface Class {
  id: string;
  title: string;
  time: string;
  date: string;
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

interface ConversationMessage {
  id: string;
  conversationId: string;
  otherUser: {
    name: string;
    email: string;
    profilePicture: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isOwn: boolean;
  };
  unreadCount: number;
}

interface RightSidebarProps {
  messages: Message[];
  upcomingClasses?: Class[];
}

export default function RightSidebar({ messages: mockMessages, upcomingClasses }: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [useRealMessages, setUseRealMessages] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Class[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Fetch upcoming events from schedule
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setIsLoadingEvents(true);
        
        // Get today's date and next 7 days
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const startDate = today.toISOString().split('T')[0];
        const endDate = nextWeek.toISOString().split('T')[0];
        
        const response = await scheduleAPI.getSchedule(startDate, endDate);
        
        if (response.success && response.schedule) {
          // Transform schedule data to upcoming events format
          const events: Class[] = [];
          const now = new Date();
          
          response.schedule.forEach(daySchedule => {
            daySchedule.tasks.forEach((task: ScheduleTask) => {
              // Create a date object for this task
              const taskDateTime = new Date(`${daySchedule.date}T${task.startTime}`);
              
              // Only include future events
              if (taskDateTime > now) {
                // Format the date for display
                const eventDate = new Date(daySchedule.date);
                const formattedDate = eventDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });
                
                events.push({
                  id: task.id,
                  title: task.title,
                  time: `${task.startTime} - ${task.endTime}`,
                  date: formattedDate,
                  room: task.location || 'TBD',
                  students: task.attendees || 0
                });
              }
            });
          });
          
          // Sort by datetime and take first 3
          events.sort((a, b) => {
            const aTime = new Date(`${startDate}T${a.time.split(' - ')[0]}`);
            const bTime = new Date(`${startDate}T${b.time.split(' - ')[0]}`);
            return aTime.getTime() - bTime.getTime();
          });
          
          setUpcomingEvents(events.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        setUpcomingEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchUpcomingEvents, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch real conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await fetch('/api/messages/conversations');
        
        if (response.ok) {
          const data = await response.json();
          const formattedConversations: ConversationMessage[] = data.conversations.map((conv: any) => ({
            id: conv.conversationId,
            conversationId: conv.conversationId,
            otherUser: {
              name: conv.otherUser.name,
              email: conv.otherUser.email,
              profilePicture: conv.otherUser.profilePicture || '',
            },
            lastMessage: {
              text: conv.lastMessage.text,
              timestamp: new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              isOwn: conv.lastMessage.isOwn,
            },
            unreadCount: conv.unreadCount,
          }));
          
          setConversations(formattedConversations);
          setUseRealMessages(true);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        // Keep using mock messages if API fails
        setUseRealMessages(false);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchConversations();
    
    // Set up interval to refresh conversations every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6 w-80">
      {/* Upcoming Events */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
          <div className="flex items-center space-x-2">
            <Link 
              href="/schedule" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="View full schedule"
            >
              <FiExternalLink size={18} />
            </Link>
            <FiCalendar className="text-gray-400" size={20} />
          </div>
        </div>
        <div className="space-y-4">
          {isLoadingEvents ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href="/schedule"
                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FiCalendar className="mr-1" size={14} />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <FiClock className="mr-1" size={14} />
                      {event.time}
                    </div>
                  </div>
                  {event.students > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {event.students} attendees
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{event.room}</p>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiCalendar className="mx-auto mb-2" size={24} />
              <p className="text-sm">No upcoming events</p>
              <Link 
                href="/schedule" 
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Create an event
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Message Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
          <div className="flex items-center space-x-2">
            {useRealMessages && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Live messages" />
            )}
            <Link 
              href="/messages" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
              title="View all messages"
            >
              <FiExternalLink size={18} />
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {isLoadingMessages ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : useRealMessages ? (
            // Real messages from conversations API
            filteredConversations.slice(0, 5).length > 0 ? (
              filteredConversations.slice(0, 5).map((conv) => (
                <Link
                  key={conv.id}
                  href={`/messages?conversation=${conv.conversationId}`}
                  className={`flex items-start space-x-3 p-3 rounded-lg ${
                    conv.unreadCount > 0 ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } transition-colors cursor-pointer`}
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    {conv.otherUser.profilePicture ? (
                      <Image
                        src={conv.otherUser.profilePicture}
                        alt={conv.otherUser.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {conv.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{conv.otherUser.name}</h3>
                      <span className="text-xs text-gray-500">{conv.lastMessage.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage.isOwn ? 'You: ' : ''}{conv.lastMessage.text}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiMessageSquare className="mx-auto mb-2" size={24} />
                <p className="text-sm">No conversations yet</p>
                <Link 
                  href="/messages" 
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Start a conversation
                </Link>
              </div>
            )
          ) : (
            // Fallback to mock messages
            mockMessages
              .filter(msg => msg.sender.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((message) => (
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
              ))
          )}
        </div>

        {/* View All Messages Link */}
        {useRealMessages && conversations.length > 5 && (
          <div className="mt-4 text-center">
            <Link 
              href="/messages" 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all {conversations.length} conversations →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 