import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

interface CreateCourseButtonProps {
  onClick: () => void;
}

export default function CreateCourseButton({ onClick }: CreateCourseButtonProps) {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.trackEvent('create_course_button_click', {
      source: 'courses_sidebar',
      cta_type: 'create_course'
    });
    onClick();
  };

  return (
    <button 
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full mb-4 justify-center cursor-pointer"
      onClick={handleClick}
    >
      <FiPlus className="text-white" />
      Create course
    </button>
  );
} 