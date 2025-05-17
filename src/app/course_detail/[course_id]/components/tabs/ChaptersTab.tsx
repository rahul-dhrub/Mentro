import React, { useState, useRef } from 'react';
import { FiPlus, FiX, FiVideo, FiCalendar, FiUpload, FiLink, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { SiZoom, SiGooglemeet } from 'react-icons/si';
import { MdOutlineCircle } from 'react-icons/md';
import { Chapter, VideoContent } from '../../types';
import ChapterItem from '../ChapterItem';

interface ChaptersTabProps {
  chapters: Chapter[];
  expandedChapters: Set<string>;
  onAddChapter: () => void;
  onToggleChapter: (chapterId: string) => void;
  onEditChapter: (chapterId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddLesson: (chapterId: string) => void;
  onEditLesson: (chapterId: string, lessonId: string) => void;
  onDeleteLesson: (chapterId: string, lessonId: string) => void;
}

export default function ChaptersTab({
  chapters,
  expandedChapters,
  onAddChapter,
  onToggleChapter,
  onEditChapter,
  onDeleteChapter,
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}: ChaptersTabProps) {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('recorded');
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  
  // Form states
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [videoContents, setVideoContents] = useState<VideoContent[]>([]);
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState<number | null>(null);
  const [liveScheduleDate, setLiveScheduleDate] = useState('');
  const [liveScheduleTime, setLiveScheduleTime] = useState('');
  const [liveScheduleLink, setLiveScheduleLink] = useState('');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const videoTitleInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddLessonClick = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setShowLessonModal(true);
    resetForm();
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };
  
  const resetForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setLessonDuration('');
    setVideoContents([]);
    setCurrentVideoTitle('');
    setCurrentVideoUrl('');
    setIsAddingVideo(false);
    setEditingVideoIndex(null);
    setLiveScheduleDate('');
    setLiveScheduleTime('');
    setLiveScheduleLink('');
  };
  
  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !currentChapterId) return;
    
    // Create lesson object based on selected tab
    const lessonData = {
      title: lessonTitle,
      description: lessonDescription,
      duration: lessonDuration,
      isLive: activeModalTab === 'live',
      ...(activeModalTab === 'recorded' 
        ? { videoContents } 
        : { liveScheduleDate, liveScheduleTime, liveScheduleLink })
    };
    
    console.log('Saving lesson:', lessonData);
    
    // Call the parent handler with the new lesson data
    onAddLesson(currentChapterId);
    
    // Close modal and reset form
    setShowLessonModal(false);
    resetForm();
  };
  
  const handleAddVideo = () => {
    if (!currentVideoTitle.trim() || !currentVideoUrl.trim()) return;
    
    if (editingVideoIndex !== null) {
      // Update existing video
      setVideoContents(prev => {
        const updated = [...prev];
        updated[editingVideoIndex] = {
          ...updated[editingVideoIndex],
          title: currentVideoTitle,
          url: currentVideoUrl,
        };
        return updated;
      });
      setEditingVideoIndex(null);
    } else {
      // Add new video
      const newVideo: VideoContent = {
        id: Date.now().toString(),
        title: currentVideoTitle,
        url: currentVideoUrl,
        type: 'video',
        order: videoContents.length,
      };
      setVideoContents(prev => [...prev, newVideo]);
    }
    
    // Reset video form fields
    setCurrentVideoTitle('');
    setCurrentVideoUrl('');
    setIsAddingVideo(false);
  };
  
  const handleEditVideo = (index: number) => {
    const video = videoContents[index];
    setCurrentVideoTitle(video.title);
    setCurrentVideoUrl(video.url);
    setEditingVideoIndex(index);
    setIsAddingVideo(true);
    setTimeout(() => videoTitleInputRef.current?.focus(), 100);
  };
  
  const handleDeleteVideo = (index: number) => {
    setVideoContents(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      // Update order of remaining videos
      return updated.map((video, idx) => ({ ...video, order: idx }));
    });
  };
  
  const handleCancelAddVideo = () => {
    setCurrentVideoTitle('');
    setCurrentVideoUrl('');
    setIsAddingVideo(false);
    setEditingVideoIndex(null);
  };
  
  const handleCreateMeetingLink = (platform: 'zoom' | 'meet' | 'mentro') => {
    let link = '';
    
    switch (platform) {
      case 'zoom':
        link = 'https://zoom.us/j/';
        break;
      case 'meet':
        link = 'https://meet.google.com/';
        break;
      case 'mentro':
        link = 'https://mentro.com/meeting/';
        break;
    }
    
    setLiveScheduleLink(link);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
        <button
          onClick={onAddChapter}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <FiPlus size={20} />
          <span>Add Chapter</span>
        </button>
      </div>
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            isExpanded={expandedChapters.has(chapter.id)}
            onToggle={() => onToggleChapter(chapter.id)}
            onEdit={() => onEditChapter(chapter.id)}
            onDelete={() => onDeleteChapter(chapter.id)}
            onAddLesson={() => handleAddLessonClick(chapter.id)}
            onEditLesson={(lessonId) => onEditLesson(chapter.id, lessonId)}
            onDeleteLesson={(lessonId) => onDeleteLesson(chapter.id, lessonId)}
          />
        ))}
      </div>
      
      {/* Add Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Lesson</h3>
              <button 
                onClick={() => setShowLessonModal(false)}
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                      Videos Content
                    </label>
                    {!isAddingVideo && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingVideo(true);
                          setTimeout(() => videoTitleInputRef.current?.focus(), 100);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <FiPlus size={16} />
                        <span>Add Video</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Video list */}
                  {videoContents.length > 0 && !isAddingVideo && (
                    <div className="space-y-2">
                      {videoContents.map((video, index) => (
                        <div key={video.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{video.title}</h4>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{video.url}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditVideo(index)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVideo(index)}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add/Edit video form */}
                  {isAddingVideo && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Video Title *
                        </label>
                        <input
                          ref={videoTitleInputRef}
                          id="video-title"
                          type="text"
                          value={currentVideoTitle}
                          onChange={(e) => setCurrentVideoTitle(e.target.value)}
                          placeholder="Enter video title"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        />
                      </div>
                      <div>
                        <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">
                          Video URL *
                        </label>
                        <input
                          id="video-url"
                          type="text"
                          value={currentVideoUrl}
                          onChange={(e) => setCurrentVideoUrl(e.target.value)}
                          placeholder="https://example.com/video"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleCancelAddVideo}
                          className="px-3 py-1 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddVideo}
                          disabled={!currentVideoTitle.trim() || !currentVideoUrl.trim()}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm cursor-pointer"
                        >
                          {editingVideoIndex !== null ? 'Update Video' : 'Add Video'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {videoContents.length === 0 && !isAddingVideo && (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">No videos added yet. Click "Add Video" to get started.</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                      </label>
                      <input
                        id="schedule-date"
                        type="date"
                        value={liveScheduleDate}
                        onChange={(e) => setLiveScheduleDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>
                    <div>
                      <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                      </label>
                      <input
                        id="schedule-time"
                        type="time"
                        value={liveScheduleTime}
                        onChange={(e) => setLiveScheduleTime(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="schedule-link" className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Link
                    </label>
                    <div className="relative">
                      <input
                        id="schedule-link"
                        type="text"
                        value={liveScheduleLink}
                        onChange={(e) => setLiveScheduleLink(e.target.value)}
                        placeholder="https://meeting-platform.com/join"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 pr-32"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-3">
                        <button
                          type="button"
                          onClick={() => handleCreateMeetingLink('zoom')}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title="Create Zoom Link"
                        >
                          <SiZoom size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCreateMeetingLink('meet')}
                          className="text-green-600 hover:text-green-800 cursor-pointer"
                          title="Create Google Meet Link"
                        >
                          <SiGooglemeet size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCreateMeetingLink('mentro')}
                          className="text-purple-600 hover:text-purple-800 cursor-pointer"
                          title="Create Mentro Link"
                        >
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-purple-600 hover:border-purple-800">
                            <span className="text-sm font-bold">M</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLesson}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  disabled={!lessonTitle.trim() || (activeModalTab === 'recorded' && videoContents.length === 0)}
                >
                  Save Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 