'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiBell, FiBook, FiCalendar, FiMessageSquare, FiSettings, FiUser, FiLogOut, FiMenu } from 'react-icons/fi';

interface NavbarProps {
  user: {
    name: string;
    avatar: string;
    title: string;
  };
  onSidebarToggle: () => void;
  isSidebarVisible: boolean;
}

export default function Navbar({ user, onSidebarToggle, isSidebarVisible }: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: '1',
      title: 'New Assignment Submission',
      message: 'John Doe submitted the Machine Learning assignment',
      time: '5m ago',
      unread: true
    },
    {
      id: '2',
      title: 'Course Update',
      message: 'New materials added to Data Structures course',
      time: '1h ago',
      unread: true
    },
    {
      id: '3',
      title: 'Meeting Reminder',
      message: 'Department meeting in 30 minutes',
      time: '2h ago',
      unread: false
    }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Menu */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarToggle}
              className="p-2 text-gray-600 hover:text-blue-600"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              <FiMenu size={24} />
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <FiBook className="text-blue-600" size={24} />
              <span className="text-xl font-semibold text-gray-900">Mentro</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600">
              Courses
            </Link>
            <Link href="/schedule" className="text-gray-600 hover:text-blue-600">
              Schedule
            </Link>
            <Link href="/students" className="text-gray-600 hover:text-blue-600">
              Students
            </Link>
            <Link href="/resources" className="text-gray-600 hover:text-blue-600">
              Resources
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-blue-600 relative"
              >
                <FiBell size={20} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{notification.title}</p>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                          </div>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2"
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="hidden md:block text-gray-700">{user.name}</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.title}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <FiUser className="mr-2" size={16} />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <FiSettings className="mr-2" size={16} />
                      Settings
                    </Link>
                    <button
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <FiLogOut className="mr-2" size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 