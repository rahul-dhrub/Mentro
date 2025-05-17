import React, { useState, useRef } from 'react';
import { 
  FiPlus, FiX, FiVideo, FiCalendar, FiUpload, FiLink, FiTrash2, FiEdit2, 
  FiAlertTriangle, FiCheck, FiClipboard, FiImage, FiFile, FiPaperclip 
} from 'react-icons/fi';
import { SiZoom, SiGooglemeet } from 'react-icons/si';
import { MdOutlineCircle } from 'react-icons/md';
import { Chapter, VideoContent } from '../../types';
import ChapterItem from '../ChapterItem';
import { initializeVideoUpload, uploadVideoToBunny, waitForVideoProcessing } from '../../../../utils/videoUpload';
import { uploadFileToBunnyStorage, StorageUploadResponse } from '../../../../utils/fileUpload';

// Content types for the lesson content
type ContentType = 'video' | 'image' | 'link' | 'pdf';

// Rename VideoContent to LessonContent to reflect broader scope
interface LessonContent {
  id: string;
  title: string;
  url: string;
  type: ContentType;
  order: number;
}

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
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [currentContentType, setCurrentContentType] = useState<ContentType>('video');
  const [currentContentTitle, setCurrentContentTitle] = useState('');
  const [currentContentUrl, setCurrentContentUrl] = useState('');
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null);
  const [liveScheduleDate, setLiveScheduleDate] = useState('');
  const [liveScheduleTime, setLiveScheduleTime] = useState('');
  const [liveScheduleLink, setLiveScheduleLink] = useState('');
  
  // Video upload states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const videoTitleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    setLessonContents([]);
    setCurrentContentType('video');
    setCurrentContentTitle('');
    setCurrentContentUrl('');
    setIsAddingContent(false);
    setEditingContentIndex(null);
    setLiveScheduleDate('');
    setLiveScheduleTime('');
    setLiveScheduleLink('');
    
    // Reset video upload states
    setShowUploadModal(false);
    setSelectedFile(null);
    setVideoInfo(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
    setCopied(false);
  };
  
  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !currentChapterId) return;
    
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
    onAddLesson(currentChapterId);
    
    // Close modal and reset form
    setShowLessonModal(false);
    resetForm();
  };
  
  const handleAddContent = () => {
    if (!currentContentTitle.trim() || !currentContentUrl.trim()) return;
    
    if (editingContentIndex !== null) {
      // Update existing content
      setLessonContents(prev => {
        const updated = [...prev];
        updated[editingContentIndex] = {
          ...updated[editingContentIndex],
          title: currentContentTitle,
          url: currentContentUrl,
          type: currentContentType,
        };
        return updated;
      });
      setEditingContentIndex(null);
    } else {
      // Add new content
      const newContent: LessonContent = {
        id: Date.now().toString(),
        title: currentContentTitle,
        url: currentContentUrl,
        type: currentContentType,
        order: lessonContents.length,
      };
      setLessonContents(prev => [...prev, newContent]);
    }
    
    // Reset content form fields
    setCurrentContentTitle('');
    setCurrentContentUrl('');
    setIsAddingContent(false);
  };
  
  const handleEditContent = (index: number) => {
    const content = lessonContents[index];
    setCurrentContentTitle(content.title);
    setCurrentContentUrl(content.url);
    setEditingContentIndex(index);
    setIsAddingContent(true);
    setTimeout(() => videoTitleInputRef.current?.focus(), 100);
  };
  
  const handleDeleteContent = (index: number) => {
    setLessonContents(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      // Update order of remaining contents
      return updated.map((content, idx) => ({ ...content, order: idx }));
    });
  };
  
  const handleCancelAddContent = () => {
    setCurrentContentTitle('');
    setCurrentContentUrl('');
    setIsAddingContent(false);
    setEditingContentIndex(null);
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
  
  const handleUploadContent = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // For non-video files (images and PDFs), use Bunny.net storage
      if (currentContentType === 'image' || currentContentType === 'pdf') {
        // Use the file upload utilities
        const result = await uploadFileToBunnyStorage(
          selectedFile,
          (progress: number) => setUploadProgress(progress)
        );
        
        // Set file info from the result
        setVideoInfo({
          url: result.downloadUrl,
          title: selectedFile.name,
          type: currentContentType,
          storagePath: result.storagePath
        });
        
        setIsUploading(false);
        return;
      }
      
      // If it's a link type, we shouldn't get here, but just in case
      if (currentContentType === 'link') {
        setUploadError('Links cannot be uploaded. Please enter a URL directly.');
        setIsUploading(false);
        return;
      }
      
      // For videos, use the existing Bunny.net streaming integration
      const title = selectedFile.name.replace(/\.[^/.]+$/, "");
      const { guid, uploadUrl, httpMethod, headers } = await initializeVideoUpload(
        title,
        selectedFile.name
      );
      
      await uploadVideoToBunny(
        selectedFile,
        uploadUrl,
        httpMethod,
        headers,
        (progress: number) => setUploadProgress(progress)
      );
      
      setIsUploading(false);
      setIsProcessing(true);
      
      const processedVideo = await waitForVideoProcessing(guid);
      setVideoInfo(processedVideo);
      
      setIsProcessing(false);
    } catch (error: any) {
      console.error('Error uploading content:', error);
      
      let errorMessage = 'Failed to upload content';
      if (error.message.includes('network')) {
        errorMessage = 'Network connection lost. Please try again with a stable connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again with a smaller file or better connection.';
      } else if (error.message.includes('aborted')) {
        errorMessage = 'Upload was aborted. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file types
      if (currentContentType === 'video' && !file.type.startsWith('video/')) {
        setUploadError('Please select a valid video file');
        return;
      } else if (currentContentType === 'image' && !file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file');
        return;
      } else if (currentContentType === 'pdf' && file.type !== 'application/pdf') {
        setUploadError('Please select a valid PDF file');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
      
      // Auto-set the content title based on filename
      if (!currentContentTitle) {
        setCurrentContentTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };
  
  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setVideoInfo(null);
    setUploadError(null);
    setUploadProgress(0);
    setCopied(false);
  };
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const useVideoUrlAndCloseModal = () => {
    if (videoInfo?.streamingUrl) {
      setCurrentContentUrl(videoInfo.streamingUrl);
    }
    closeUploadModal();
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
                      Content
                    </label>
                    {!isAddingContent && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingContent(true);
                          setTimeout(() => videoTitleInputRef.current?.focus(), 100);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm cursor-pointer"
                      >
                        <FiPlus size={16} />
                        <span>Add Content</span>
                      </button>
                    )}
                  </div>
                  
                  {/* Content list */}
                  {lessonContents.length > 0 && !isAddingContent && (
                    <div className="space-y-2">
                      {lessonContents.map((content, index) => (
                        <div key={content.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            {content.type === 'video' && <FiVideo className="text-blue-500 mr-2" size={18} />}
                            {content.type === 'image' && <FiImage className="text-green-500 mr-2" size={18} />}
                            {content.type === 'pdf' && <FiFile className="text-red-500 mr-2" size={18} />}
                            {content.type === 'link' && <FiLink className="text-purple-500 mr-2" size={18} />}
                            <div>
                              <h4 className="font-medium text-gray-900">{content.title}</h4>
                              <p className="text-sm text-gray-500 truncate max-w-xs">{content.url}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleEditContent(index)}
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContent(index)}
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add/Edit content form */}
                  {isAddingContent && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      {/* Content Type Selector */}
                      <div className="flex border-b border-gray-200 mb-3">
                        <button
                          type="button"
                          onClick={() => setCurrentContentType('video')}
                          className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                            currentContentType === 'video' 
                              ? 'text-blue-600 border-b-2 border-blue-500' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <FiVideo className="mr-2" />
                          Video
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentContentType('image')}
                          className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                            currentContentType === 'image' 
                              ? 'text-blue-600 border-b-2 border-blue-500' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <FiImage className="mr-2" />
                          Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentContentType('pdf')}
                          className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                            currentContentType === 'pdf' 
                              ? 'text-blue-600 border-b-2 border-blue-500' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <FiFile className="mr-2" />
                          PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentContentType('link')}
                          className={`px-3 py-2 text-sm font-medium flex items-center ${
                            currentContentType === 'link' 
                              ? 'text-blue-600 border-b-2 border-blue-500' 
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <FiLink className="mr-2" />
                          Link
                        </button>
                      </div>

                      <div>
                        <label htmlFor="content-title" className="block text-sm font-medium text-gray-700 mb-1">
                          Content Title *
                        </label>
                        <input
                          ref={videoTitleInputRef}
                          id="content-title"
                          type="text"
                          value={currentContentTitle}
                          onChange={(e) => setCurrentContentTitle(e.target.value)}
                          placeholder="Enter content title"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        />
                      </div>
                      <div>
                        <label htmlFor="content-url" className="block text-sm font-medium text-gray-700 mb-1">
                          {currentContentType === 'link' ? 'URL *' : 'Content URL *'}
                        </label>
                        <div className="relative">
                          <input
                            id="content-url"
                            type="text"
                            value={currentContentUrl}
                            onChange={(e) => setCurrentContentUrl(e.target.value)}
                            placeholder={
                              currentContentType === 'video' ? 'https://example.com/video' :
                              currentContentType === 'image' ? 'https://example.com/image.jpg' :
                              currentContentType === 'pdf' ? 'https://example.com/document.pdf' :
                              'https://example.com'
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 pr-12"
                          />
                          {currentContentType !== 'link' && (
                            <button
                              type="button"
                              onClick={() => setShowUploadModal(true)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded cursor-pointer transition-colors"
                              title={`Upload ${currentContentType}`}
                            >
                              <FiUpload size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleCancelAddContent}
                          className="px-3 py-1 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddContent}
                          disabled={!currentContentTitle.trim() || !currentContentUrl.trim()}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm cursor-pointer"
                        >
                          {editingContentIndex !== null ? 'Update Content' : 'Add Content'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {lessonContents.length === 0 && !isAddingContent && (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-500">No content added yet. Click "Add Content" to get started.</p>
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
                  
                  {/* Videos Content for Live Schedule */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Additional Content
                      </label>
                      {!isAddingContent && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingContent(true);
                            setTimeout(() => videoTitleInputRef.current?.focus(), 100);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm cursor-pointer"
                        >
                          <FiPlus size={16} />
                          <span>Add Content</span>
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      Add supplementary content to enhance your live session
                    </p>
                    
                    {/* Content list */}
                    {lessonContents.length > 0 && !isAddingContent && (
                      <div className="space-y-2">
                        {lessonContents.map((content, index) => (
                          <div key={content.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center">
                              {content.type === 'video' && <FiVideo className="text-blue-500 mr-2" size={18} />}
                              {content.type === 'image' && <FiImage className="text-green-500 mr-2" size={18} />}
                              {content.type === 'pdf' && <FiFile className="text-red-500 mr-2" size={18} />}
                              {content.type === 'link' && <FiLink className="text-purple-500 mr-2" size={18} />}
                              <div>
                                <h4 className="font-medium text-gray-900">{content.title}</h4>
                                <p className="text-sm text-gray-500 truncate max-w-xs">{content.url}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleEditContent(index)}
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteContent(index)}
                                className="text-red-600 hover:text-red-800 cursor-pointer"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add/Edit content form */}
                    {isAddingContent && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex border-b border-gray-200 mb-3">
                          <button
                            type="button"
                            onClick={() => setCurrentContentType('video')}
                            className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                              currentContentType === 'video' 
                                ? 'text-blue-600 border-b-2 border-blue-500' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <FiVideo className="mr-2" />
                            Video
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentContentType('image')}
                            className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                              currentContentType === 'image' 
                                ? 'text-blue-600 border-b-2 border-blue-500' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <FiImage className="mr-2" />
                            Image
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentContentType('pdf')}
                            className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                              currentContentType === 'pdf' 
                                ? 'text-blue-600 border-b-2 border-blue-500' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <FiFile className="mr-2" />
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrentContentType('link')}
                            className={`px-3 py-2 text-sm font-medium flex items-center ${
                              currentContentType === 'link' 
                                ? 'text-blue-600 border-b-2 border-blue-500' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <FiLink className="mr-2" />
                            Link
                          </button>
                        </div>
                        
                        <div>
                          <label htmlFor="content-title-live" className="block text-sm font-medium text-gray-700 mb-1">
                            Content Title *
                          </label>
                          <input
                            ref={videoTitleInputRef}
                            id="content-title-live"
                            type="text"
                            value={currentContentTitle}
                            onChange={(e) => setCurrentContentTitle(e.target.value)}
                            placeholder="Enter content title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                          />
                        </div>
                        <div>
                          <label htmlFor="content-url-live" className="block text-sm font-medium text-gray-700 mb-1">
                            {currentContentType === 'link' ? 'URL *' : 'Content URL *'}
                          </label>
                          <div className="relative">
                            <input
                              id="content-url-live"
                              type="text"
                              value={currentContentUrl}
                              onChange={(e) => setCurrentContentUrl(e.target.value)}
                              placeholder={
                                currentContentType === 'video' ? 'https://example.com/video' :
                                currentContentType === 'image' ? 'https://example.com/image.jpg' :
                                currentContentType === 'pdf' ? 'https://example.com/document.pdf' :
                                'https://example.com'
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 pr-12"
                            />
                            {currentContentType !== 'link' && (
                              <button
                                type="button"
                                onClick={() => setShowUploadModal(true)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded cursor-pointer transition-colors"
                                title={`Upload ${currentContentType}`}
                              >
                                <FiUpload size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={handleCancelAddContent}
                            className="px-3 py-1 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleAddContent}
                            disabled={!currentContentTitle.trim() || !currentContentUrl.trim()}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm cursor-pointer"
                          >
                            {editingContentIndex !== null ? 'Update Content' : 'Add Content'}
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {lessonContents.length === 0 && !isAddingContent && (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-gray-500">No content added yet. Click "Add Content" to provide supplementary content.</p>
                      </div>
                    )}
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
                  disabled={!lessonTitle.trim()}
                >
                  Save Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Upload {currentContentType === 'video' ? 'Video' : 
                       currentContentType === 'image' ? 'Image' : 
                       'PDF Document'}
              </h3>
              <button 
                onClick={closeUploadModal}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              {!videoInfo ? (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {currentContentType === 'video' && <FiVideo className="mx-auto text-gray-400 mb-3" size={36} />}
                    {currentContentType === 'image' && <FiImage className="mx-auto text-gray-400 mb-3" size={36} />}
                    {currentContentType === 'pdf' && <FiFile className="mx-auto text-gray-400 mb-3" size={36} />}
                    
                    <p className="text-sm text-gray-600 mb-2">
                      Select a {currentContentType} file to upload
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept={
                        currentContentType === 'video' ? 'video/*' : 
                        currentContentType === 'image' ? 'image/*' : 
                        'application/pdf'
                      }
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      disabled={isUploading || isProcessing}
                    >
                      Browse Files
                    </button>
                  </div>
                  
                  {selectedFile && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Uploading... {uploadProgress}%
                      </p>
                      <p className="text-xs text-gray-500 text-center">
                        Large files are uploaded in chunks. Please keep this window open.
                      </p>
                      <p className="text-xs text-gray-500 text-center">
                        Network interruptions will be automatically handled.
                      </p>
                    </div>
                  )}
                  
                  {/* Processing message only needed for videos */}
                  {isProcessing && currentContentType === 'video' && (
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <div className="animate-pulse flex space-x-4 justify-center items-center">
                        <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                        <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                        <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                      </div>
                      <p className="text-blue-700 mt-2">
                        Processing video... This may take a few minutes.
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Your upload was successful. Bunny.net is now processing your video.
                      </p>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="bg-red-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-start">
                        <FiAlertTriangle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-red-600">{uploadError}</p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={handleUploadContent}
                          disabled={!selectedFile || isUploading || isProcessing}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Retry Upload
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUploadContent}
                      disabled={!selectedFile || isUploading || isProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Content'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center mb-4">
                    <FiCheck className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-green-700 font-medium">
                      {currentContentType === 'video' ? 'Video' : 
                       currentContentType === 'image' ? 'Image' : 
                       'PDF document'} uploaded successfully!
                    </p>
                  </div>
                  
                  {/* Preview for images */}
                  {currentContentType === 'image' && videoInfo.url && (
                    <div className="mb-4 text-center">
                      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                      <div className="border border-gray-300 rounded-lg p-2 inline-block">
                        <img 
                          src={videoInfo.url} 
                          alt={videoInfo.title} 
                          className="max-h-40 max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Preview for PDFs - just a link */}
                  {currentContentType === 'pdf' && videoInfo.url && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Document Preview:</p>
                      <a 
                        href={videoInfo.url}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline flex items-center"
                      >
                        <FiFile className="mr-1" />
                        View PDF
                      </a>
                    </div>
                  )}
                  
                  <p className="text-sm font-medium text-gray-700 mb-1">Content URL:</p>
                  <div className="bg-white border border-gray-300 rounded-lg p-2 mb-3 flex justify-between items-center">
                    <p className="text-sm text-gray-700 truncate">{videoInfo.url || videoInfo.streamingUrl}</p>
                    <button
                      onClick={() => copyToClipboard(videoInfo.url || videoInfo.streamingUrl)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                      title="Copy URL"
                    >
                      <FiClipboard size={16} />
                    </button>
                  </div>
                  
                  {/* For videos, also show the direct download URL if available */}
                  {currentContentType === 'video' && videoInfo.directUrl && (
                    <>
                      <p className="text-sm font-medium text-gray-700 mb-1">Direct Download URL:</p>
                      <div className="bg-white border border-gray-300 rounded-lg p-2 mb-2 flex justify-between items-center">
                        <p className="text-sm text-gray-700 truncate">{videoInfo.directUrl}</p>
                        <button
                          onClick={() => copyToClipboard(videoInfo.directUrl)}
                          className="ml-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                          title="Copy download URL"
                        >
                          <FiClipboard size={16} />
                        </button>
                      </div>
                    </>
                  )}
                  
                  {copied && (
                    <p className="text-xs text-green-600 mt-1">
                      URL copied to clipboard!
                    </p>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={closeUploadModal}
                      className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={useVideoUrlAndCloseModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Use This URL
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 