import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { LessonEditModalProps } from './types';

export default function LessonEditModal({
  isOpen,
  onClose,
  chapterId,
  lessonId,
  lesson,
  onEditLesson
}: LessonEditModalProps) {
  const [lessonTitle, setLessonTitle] = useState('');
  const [titleDescription, setTitleDescription] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [liveScheduleDate, setLiveScheduleDate] = useState('');
  const [liveScheduleTime, setLiveScheduleTime] = useState('');
  const [liveScheduleLink, setLiveScheduleLink] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [isUpdating, setIsUpdating] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Populate form when lesson changes
  useEffect(() => {
    if (lesson) {
      setLessonTitle(lesson.title || '');
      setTitleDescription(lesson.titleDescription || '');
      setLessonDescription(lesson.description || '');
      setLessonDuration(lesson.duration || '');
      setIsPublished(lesson.isPublished || false);
      setIsLive(lesson.isLive || false);
      setLiveScheduleDate(lesson.liveScheduleDate || '');
      setLiveScheduleTime(lesson.liveScheduleTime || '');
      setLiveScheduleLink(lesson.liveScheduleLink || '');
      setTimezone(lesson.timezone || 'UTC');
    }
  }, [lesson]);

  // Focus on title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleUpdateLesson = async () => {
    if (lessonTitle.trim()) {
      try {
        setIsUpdating(true);
        
        const lessonData = {
          title: lessonTitle,
          titleDescription: titleDescription,
          description: lessonDescription,
          duration: lessonDuration,
          isPublished,
          isLive,
          liveScheduleDate: isLive ? liveScheduleDate : undefined,
          liveScheduleTime: isLive ? liveScheduleTime : undefined,
          liveScheduleLink: isLive ? liveScheduleLink : undefined,
          timezone: isLive ? timezone : undefined,
        };

        await onEditLesson(chapterId, lessonId, lessonData);
        onClose();
      } catch (error) {
        console.error('Error updating lesson:', error);
        // You could show an error message to the user here
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit Lesson</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            disabled={isUpdating}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-lesson-title" className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title
            </label>
            <input
              id="edit-lesson-title"
              ref={titleInputRef}
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Enter lesson title"
              disabled={isUpdating}
            />
          </div>
          
          <div>
            <label htmlFor="edit-title-description" className="block text-sm font-medium text-gray-700 mb-2">
              Title Description
            </label>
            <input
              id="edit-title-description"
              type="text"
              value={titleDescription}
              onChange={(e) => setTitleDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Enter title description"
              disabled={isUpdating}
            />
          </div>
          
          <div>
            <label htmlFor="edit-lesson-description" className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Description
            </label>
            <textarea
              id="edit-lesson-description"
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none"
              rows={4}
              placeholder="Enter lesson description (supports markdown)"
              disabled={isUpdating}
            />
          </div>

          <div>
            <label htmlFor="edit-lesson-duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input
              id="edit-lesson-duration"
              type="text"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="e.g., 45 minutes"
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <input
                id="edit-lesson-published"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isUpdating}
              />
              <label htmlFor="edit-lesson-published" className="ml-2 block text-sm text-gray-700">
                Published
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="edit-lesson-live"
                type="checkbox"
                checked={isLive}
                onChange={(e) => setIsLive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isUpdating}
              />
              <label htmlFor="edit-lesson-live" className="ml-2 block text-sm text-gray-700">
                Live Lesson
              </label>
            </div>
          </div>

          {/* Live lesson fields */}
          {isLive && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900">Live Lesson Schedule</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-live-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    id="edit-live-date"
                    type="date"
                    value={liveScheduleDate}
                    onChange={(e) => setLiveScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    disabled={isUpdating}
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-live-time" className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    id="edit-live-time"
                    type="time"
                    value={liveScheduleTime}
                    onChange={(e) => setLiveScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    disabled={isUpdating}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-live-link" className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Link
                </label>
                <input
                  id="edit-live-link"
                  type="url"
                  value={liveScheduleLink}
                  onChange={(e) => setLiveScheduleLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  placeholder="https://zoom.us/j/... or Google Meet link"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label htmlFor="edit-timezone" className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  id="edit-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  disabled={isUpdating}
                >
                  <option value="UTC">UTC+0: Greenwich Mean Time</option>
                  <option value="America/New_York">UTC-5: Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">UTC-6: Central Time (US & Canada)</option>
                  <option value="America/Denver">UTC-7: Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">UTC-8: Pacific Time (US & Canada)</option>
                  <option value="Europe/London">UTC+0: London</option>
                  <option value="Europe/Paris">UTC+1: Central European Time</option>
                  <option value="Asia/Kolkata">UTC+5:30: India, Sri Lanka</option>
                  <option value="Asia/Shanghai">UTC+8: China, Singapore</option>
                  <option value="Asia/Tokyo">UTC+9: Japan, Korea</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateLesson}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isUpdating || !lessonTitle.trim()}
            >
              {isUpdating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isUpdating ? 'Updating...' : 'Update Lesson'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 