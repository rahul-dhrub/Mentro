'use client';

import { FiBook, FiCalendar, FiFileText, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { Course } from '../types';

interface CourseSidebarProps {
  courses: Course[];
  activeTab: 'courses' | 'classes' | 'tests';
  selectedCourse: Course | null;
  onTabChange: (tab: 'courses' | 'classes' | 'tests') => void;
  onCourseSelect: (course: Course) => void;
}

export default function CourseSidebar({
  courses,
  activeTab,
  selectedCourse,
  onTabChange,
  onCourseSelect,
}: CourseSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex space-x-4 p-4 border-b">
        <button
          onClick={() => onTabChange('courses')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiBook className="inline-block mr-2" />
          Courses
        </button>
        <button
          onClick={() => onTabChange('classes')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'classes'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiCalendar className="inline-block mr-2" />
          Classes
        </button>
        <button
          onClick={() => onTabChange('tests')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'tests'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <FiFileText className="inline-block mr-2" />
          Tests
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'courses' && (
          <div className="divide-y divide-gray-200">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedCourse?.id === course.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onCourseSelect(course)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">Course Code: {course.code}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <FiUsers className="text-gray-400 mr-2" size={14} />
                    <span className="text-sm text-gray-600">{course.students} Students</span>
                  </div>
                  <div className="flex items-center">
                    <FiBarChart2 className="text-gray-400 mr-2" size={14} />
                    <span className="text-sm text-gray-600">{course.progress}% Complete</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'classes' && (
          <div className="p-4 text-center text-gray-500">
            Class schedule will be shown here
          </div>
        )}
        {activeTab === 'tests' && (
          <div className="p-4 text-center text-gray-500">
            Test schedule will be shown here
          </div>
        )}
      </div>
    </div>
  );
} 