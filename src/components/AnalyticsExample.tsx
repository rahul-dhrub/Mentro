'use client';

import React from 'react';
import { useAnalytics } from './FirebaseAnalyticsProvider';

/**
 * Example component demonstrating how to use Firebase Analytics
 * This component shows various analytics tracking scenarios
 */
export const AnalyticsExample: React.FC = () => {
  const analytics = useAnalytics();

  const handleButtonClick = () => {
    analytics.trackEvent('button_click', {
      button_name: 'example_button',
      page: 'analytics_example'
    });
  };

  const handleCourseView = (courseId: string, courseName: string) => {
    analytics.trackEvent('course_view', {
      course_id: courseId,
      course_name: courseName
    });
  };

  const handleLessonStart = (lessonId: string, lessonName: string, courseId: string) => {
    analytics.trackEvent('lesson_start', {
      lesson_id: lessonId,
      lesson_name: lessonName,
      course_id: courseId
    });
  };

  const handleQuizStart = (quizId: string, quizName: string) => {
    analytics.trackEvent('quiz_start', {
      quiz_id: quizId,
      quiz_name: quizName
    });
  };

  const handleVideoPlay = (videoId: string, videoTitle: string) => {
    analytics.trackEvent('video_play', {
      video_id: videoId,
      video_title: videoTitle
    });
  };

  const handleDownload = (resourceId: string, resourceName: string, resourceType: string) => {
    analytics.trackEvent('resource_download', {
      resource_id: resourceId,
      resource_name: resourceName,
      resource_type: resourceType
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Firebase Analytics Examples
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={handleButtonClick}
          className="block w-full text-left px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Track Button Click
        </button>

        <button
          onClick={() => handleCourseView('course-123', 'React Fundamentals')}
          className="block w-full text-left px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
        >
          Track Course View
        </button>

        <button
          onClick={() => handleLessonStart('lesson-456', 'Introduction to Hooks', 'course-123')}
          className="block w-full text-left px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
        >
          Track Lesson Start
        </button>

        <button
          onClick={() => handleQuizStart('quiz-789', 'React Basics Quiz')}
          className="block w-full text-left px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          Track Quiz Start
        </button>

        <button
          onClick={() => handleVideoPlay('video-101', 'State Management Tutorial')}
          className="block w-full text-left px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        >
          Track Video Play
        </button>

        <button
          onClick={() => handleDownload('resource-202', 'React Cheat Sheet', 'pdf')}
          className="block w-full text-left px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Track Resource Download
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Analytics Status</h4>
        <p className="text-sm text-gray-600">
          Analytics Ready: {analytics.isAnalyticsReady ? '✅ Yes' : '❌ No'}
        </p>
        {!analytics.isAnalyticsReady && (
          <p className="text-xs text-gray-500 mt-1">
            Make sure Firebase configuration is set up correctly
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsExample; 