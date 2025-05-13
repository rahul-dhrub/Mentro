'use client';

import { FiUsers, FiBarChart2, FiClock, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { Course } from '../types';

interface CourseHeaderProps {
  course: Course;
  viewMode: 'details' | 'calendar';
  onViewModeChange: (mode: 'details' | 'calendar') => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CourseHeader({
  course,
  viewMode,
  onViewModeChange,
  onEdit,
  onDelete,
}: CourseHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
          <p className="text-gray-500">Course Code: {course.code}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => onViewModeChange(viewMode === 'details' ? 'calendar' : 'details')}
            className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <FiCalendar className="mr-2" />
            {viewMode === 'details' ? 'Calendar View' : 'Details View'}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <FiEdit2 size={20} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-600 hover:text-red-600"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="flex items-center">
          <FiUsers className="text-gray-400 mr-2" />
          <span className="text-gray-600">{course.students} Students</span>
        </div>
        <div className="flex items-center">
          <FiBarChart2 className="text-gray-400 mr-2" />
          <span className="text-gray-600">{course.progress}% Complete</span>
        </div>
        {course.nextClass && (
          <div className="flex items-center">
            <FiClock className="text-gray-400 mr-2" />
            <span className="text-gray-600">
              Next: {course.nextClass.time} ({course.nextClass.room})
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 