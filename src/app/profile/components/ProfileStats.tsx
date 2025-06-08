'use client';

import { FiStar } from 'react-icons/fi';

interface ProfileStatsProps {
  stats: {
    totalCourses: number;
    totalStudents?: number;
    averageRating: number;
  };
  userRole: 'student' | 'instructor' | 'admin';
  isLoadingStudents: boolean;
}

export default function ProfileStats({ stats, userRole, isLoadingStudents }: ProfileStatsProps) {
  return (
    <div className="lg:ml-8">
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 text-center lg:text-right">
        {/* Total Courses */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-700">{stats.totalCourses}</p>
          <p className="text-sm text-blue-600 font-medium">Courses</p>
        </div>

        {/* Total Students - Only for instructors */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-center lg:justify-end">
            {isLoadingStudents ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-lg font-bold text-green-700">Loading...</span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-green-700">
                {stats.totalStudents !== undefined ? stats.totalStudents : 0}
              </p>
            )}
          </div>
          <p className="text-sm text-green-600 font-medium">Students</p>
        </div>

        {/* Average Rating */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-center lg:justify-end gap-1 mb-1">
            <FiStar className="text-yellow-500 fill-current" size={16} />
            <span className="text-2xl font-bold text-yellow-700">{stats.averageRating}</span>
          </div>
          <p className="text-sm text-yellow-600 font-medium">Rating</p>
        </div>
      </div>
    </div>
  );
} 