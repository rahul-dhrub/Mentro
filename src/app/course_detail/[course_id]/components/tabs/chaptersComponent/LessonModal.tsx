import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiVideo, FiCalendar } from 'react-icons/fi';
import { ContentType, LessonContent } from './types';
import ContentForm from './ContentForm';
import LiveScheduleForm from './LiveScheduleForm';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string | null;
  onAddLesson: (chapterId: string) => void;
}

export default function LessonModal({ 
  isOpen, 
  onClose, 
  chapterId, 
  onAddLesson 
}: LessonModalProps) {
  const [activeModalTab, setActiveModalTab] = useState('recorded');
  
  // Form states
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [liveScheduleDate, setLiveScheduleDate] = useState('');
  const [liveScheduleTime, setLiveScheduleTime] = useState('');
  const [liveScheduleLink, setLiveScheduleLink] = useState('');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  const resetForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setLessonDuration('');
    setLessonContents([]);
    setActiveModalTab('recorded');
    setLiveScheduleDate('');
    setLiveScheduleTime('');
    setLiveScheduleLink('');
  };
  
  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !chapterId) return;
    
    // Create lesson object based on selected tab
    const lessonData = {
      title: lessonTitle,
      description: lessonDescription,
      duration: lessonDuration,
      isLive: activeModalTab === 'live',
      lessonContents, // Include lesson contents for both recorded and live lessons
      ...(activeModalTab === 'live' 
        ? { liveScheduleDate, liveScheduleTime, liveScheduleLink }
        : {})
    };
    
    console.log('Saving lesson:', lessonData);
    
    // Call the parent handler with the new lesson data
    onAddLesson(chapterId);
    
    // Close modal and reset form
    onClose();
    resetForm();
  };
  
  const handleAddContent = (content: Omit<LessonContent, 'id' | 'order'>) => {
    const newContent: LessonContent = {
      id: Date.now().toString(),
      ...content,
      order: lessonContents.length,
    };
    setLessonContents(prev => [...prev, newContent]);
  };
  
  const handleEditContent = (index: number, content: Omit<LessonContent, 'id' | 'order'>) => {
    setLessonContents(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...content,
      };
      return updated;
    });
  };
  
  const handleDeleteContent = (index: number) => {
    setLessonContents(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      // Update order of remaining contents
      return updated.map((content, idx) => ({ ...content, order: idx }));
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Add New Lesson</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveModalTab('recorded')}
              className={`${
                activeModalTab === 'recorded'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer`}
            >
              <FiVideo className="mr-2" />
              Recorded Lesson
            </button>
            <button
              onClick={() => setActiveModalTab('live')}
              className={`${
                activeModalTab === 'live'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer`}
            >
              <FiCalendar className="mr-2" />
              Live Schedule
            </button>
          </nav>
        </div>
        
        {/* Common Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title *
            </label>
            <input
              ref={titleInputRef}
              id="lesson-title"
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          <div>
            <label htmlFor="lesson-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="lesson-description"
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              placeholder="Enter lesson description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          <div>
            <label htmlFor="lesson-duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              id="lesson-duration"
              type="text"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          {/* Tab-specific fields */}
          {activeModalTab === 'recorded' ? (
            <ContentForm
              lessonContents={lessonContents}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
            />
          ) : (
            <>
              <LiveScheduleForm
                scheduleDate={liveScheduleDate}
                scheduleTime={liveScheduleTime}
                scheduleLink={liveScheduleLink}
                onScheduleDateChange={setLiveScheduleDate}
                onScheduleTimeChange={setLiveScheduleTime}
                onScheduleLinkChange={setLiveScheduleLink}
              />
              
              {/* Additional content for live lessons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Content
                  </label>
                </div>
                
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Add supplementary content to enhance your live session
                </p>
                
                <ContentForm
                  lessonContents={lessonContents}
                  onAddContent={handleAddContent}
                  onEditContent={handleEditContent}
                  onDeleteContent={handleDeleteContent}
                />
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLesson}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              disabled={!lessonTitle.trim()}
            >
              Save Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 