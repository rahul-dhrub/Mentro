import React from 'react';
import { FiBook, FiClock, FiPlus } from 'react-icons/fi';
import StatCard from '../StatCard';

interface OverviewTabProps {
  onAddChapter: () => void;
  onCreateAssignment: () => void;
  onCreateQuiz: () => void;
  onTabChange: (tab: string) => void;
}

export default function OverviewTab({ 
  onAddChapter, 
  onCreateAssignment, 
  onCreateQuiz,
  onTabChange
}: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Course Statistics" icon={<FiBook className="text-blue-500" size={24} />}>
        <div>
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">150</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">75%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">4.5</p>
        </div>
      </StatCard>

      <StatCard title="Recent Activity" icon={<FiClock className="text-blue-500" size={24} />}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">New Assignment Submissions</p>
          <p className="text-sm font-medium text-gray-900">12</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Quiz Completions</p>
          <p className="text-sm font-medium text-gray-900">25</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">New Enrollments</p>
          <p className="text-sm font-medium text-gray-900">8</p>
        </div>
      </StatCard>

      <StatCard title="Quick Actions" icon={<FiPlus className="text-blue-500" size={24} />}>
        <button 
          onClick={() => {
            onTabChange('chapters');
            onAddChapter();
          }}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Add New Chapter
        </button>
        <button 
          onClick={() => {
            onTabChange('assignments');
            onCreateAssignment();
          }}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
        >
          Create Assignment
        </button>
        <button 
          onClick={() => {
            onTabChange('quizzes');
            onCreateQuiz();
          }}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Create Quiz
        </button>
      </StatCard>
    </div>
  );
} 