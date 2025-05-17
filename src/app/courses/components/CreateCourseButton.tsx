import React from 'react';
import { FiPlus } from 'react-icons/fi';

interface CreateCourseButtonProps {
  onClick: () => void;
}

export default function CreateCourseButton({ onClick }: CreateCourseButtonProps) {
  return (
    <button 
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full mb-4 justify-center"
      onClick={onClick}
    >
      <FiPlus className="text-white" />
      Create course
    </button>
  );
} 