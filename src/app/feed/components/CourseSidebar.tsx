'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiBook, FiUsers, FiFileText, FiCalendar, FiBarChart2, FiMessageSquare, FiSettings, FiX } from 'react-icons/fi';

interface Course {
  id: string;
  title: string;
  code: string;
  students: number;
  progress: number;
}

interface CourseSidebarProps {
  courses: Course[];
  activeCourseId?: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function CourseSidebar({ courses, activeCourseId, isVisible, onClose }: CourseSidebarProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const courseMenuItems = [
    { icon: FiBook, label: 'Overview', href: 'overview' },
    { icon: FiUsers, label: 'Students', href: 'students' },
    { icon: FiFileText, label: 'Materials', href: 'materials' },
    { icon: FiCalendar, label: 'Schedule', href: 'schedule' },
    { icon: FiBarChart2, label: 'Analytics', href: 'analytics' },
    { icon: FiMessageSquare, label: 'Discussions', href: 'discussions' },
    { icon: FiSettings, label: 'Settings', href: 'settings' },
  ];

  return (
    <>
      {/* Transparent Overlay */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 bottom-0 w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-600"
        >
          <FiX size={20} />
        </button>

        {/* Course List */}
        <div className="p-4 pt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Courses</h2>
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="space-y-1">
                <button
                  onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 ${
                    activeCourseId === course.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FiBook className="text-blue-600" size={18} />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{course.code}</p>
                      <p className="text-sm text-gray-500">{course.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{course.students} students</span>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </button>

                {/* Course Menu Items */}
                {expandedCourse === course.id && (
                  <div className="pl-8 space-y-1">
                    {courseMenuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={`/courses/${course.id}/${item.href}`}
                        className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg"
                        onClick={onClose}
                      >
                        <item.icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg">
              <FiCalendar size={16} />
              <span>Create New Class</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg">
              <FiFileText size={16} />
              <span>Upload Materials</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg">
              <FiUsers size={16} />
              <span>Manage Students</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 