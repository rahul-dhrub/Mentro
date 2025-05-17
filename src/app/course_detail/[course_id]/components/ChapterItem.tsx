import React from 'react';
import { FiChevronDown, FiClock, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { Chapter, Lesson } from '../types';

interface ChapterItemProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}

export default function ChapterItem({ 
  chapter, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}: ChapterItemProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-transform"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <FiChevronDown size={20} />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
              <p className="text-gray-600 mt-1">{chapter.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 flex items-center">
              <FiClock className="mr-1" />
              {chapter.duration}
            </span>
            <button onClick={onEdit} className="text-blue-600 hover:text-blue-900">
              <FiEdit2 size={18} />
            </button>
            <button onClick={onDelete} className="text-red-600 hover:text-red-900">
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Lessons Section */}
      {isExpanded && (
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">Lessons</h4>
            <button
              onClick={onAddLesson}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <FiPlus size={16} />
              <span>Add Lesson</span>
            </button>
          </div>
          <div className="space-y-4">
            {chapter.lessons.map((lesson) => (
              <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">{lesson.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500 flex items-center">
                      <FiClock className="mr-1" />
                      {lesson.duration}
                    </span>
                    <span className={`text-xs ${lesson.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <button 
                      onClick={() => onEditLesson(lesson.id)} 
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteLesson(lesson.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{lesson.assignments?.length || 0} Assignments</span>
                  <span>{lesson.quizzes?.length || 0} Quizzes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 