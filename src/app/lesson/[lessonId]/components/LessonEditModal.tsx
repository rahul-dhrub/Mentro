import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2, FiEdit2, FiSave, FiUpload, FiFileText, FiCheckSquare, FiUser, FiClock, FiCalendar } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { uploadFileToBunnyStorage } from '../../../utils/fileUpload';
import { bunnyClient } from '../../../../lib/bunny';
import { assignmentAPI, quizAPI } from '@/lib/api';

interface LessonContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'link' | 'pdf';
  order: number;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  isPublished: boolean;
  courseId: string;
  lessonId?: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  totalQuestions: number;
  isPublished: boolean;
  courseId: string;
  lessonId?: string;
}

interface Lesson {
  _id: string;
  title: string;
  titleDescription?: string;
  description: string;
  duration: string;
  isPublished: boolean;
  isLive: boolean;
  lessonContents: LessonContent[];
  liveScheduleDate?: string;
  liveScheduleTime?: string;
  liveScheduleLink?: string;
  timezone?: string;
  assignments?: string[];
  quizzes?: string[];
  chapterId?: string;
  courseId?: string;
}

interface LessonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson;
  onSave: (updatedLesson: Partial<Lesson>) => Promise<void>;
  courseId?: string;
}

// Import UploadModal (we'll need to import the actual component)
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'video' | 'image' | 'pdf' | 'link';
  onUploadSuccess: (url: string) => void;
}

// Simple UploadModal - you can replace this with the full-featured one from:
// src/app/course_detail/[course_id]/components/tabs/chaptersComponent/UploadModal.tsx
// by importing: import UploadModal from '../../../course_detail/[course_id]/components/tabs/chaptersComponent/UploadModal';
function UploadModal({ isOpen, onClose, contentType, onUploadSuccess }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file types
      if (contentType === 'video' && !file.type.startsWith('video/')) {
        setUploadError('Please select a valid video file');
        return;
      } else if (contentType === 'image' && !file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file');
        return;
      } else if (contentType === 'pdf' && file.type !== 'application/pdf') {
        setUploadError('Please select a valid PDF file');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      let resultUrl: string;

      if (contentType === 'video') {
        // Use Bunny Stream for videos
        console.log('Uploading video to Bunny Stream...');
        setUploadProgress(25);
        
        const arrayBuffer = await selectedFile.arrayBuffer();
        const videoBuffer = Buffer.from(arrayBuffer);
        
        setUploadProgress(50);
        resultUrl = await bunnyClient.uploadToStream(videoBuffer, selectedFile.name);
        setUploadProgress(100);
        
        console.log('Video uploaded to Bunny Stream:', resultUrl);
      } else {
        // Use regular Bunny Storage for other files
        console.log('Uploading file to Bunny Storage...');
        const result = await uploadFileToBunnyStorage(
          selectedFile,
          (progress: number) => setUploadProgress(progress)
        );
        resultUrl = result.downloadUrl;
      }
      
      onUploadSuccess(resultUrl);
      onClose();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      
      let errorMessage = 'Failed to upload file';
      if (contentType === 'video') {
        errorMessage = 'Failed to upload video to streaming service. Please try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network connection lost. Please try again with a stable connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again with a smaller file or better connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    onClose();
    setSelectedFile(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Upload {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            {contentType === 'video' && <span className="text-sm text-blue-600 ml-2">(Bunny Stream)</span>}
          </h3>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Select a {contentType} file to upload
              {contentType === 'video' && (
                <span className="block text-xs text-blue-600 mt-1">
                  Videos will be uploaded to streaming service for optimal playback
                </span>
              )}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={
                contentType === 'video' ? 'video/*' : 
                contentType === 'image' ? 'image/*' : 
                contentType === 'pdf' ? 'application/pdf' :
                '*/*'
              }
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={isUploading}
            >
              Browse Files
            </button>
          </div>
          
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          )}
          
          {selectedFile && (
            <div className="space-y-3">
              <p className="text-sm text-gray-700">
                Selected: {selectedFile.name}
              </p>
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      {contentType === 'video' ? 'Uploading to streaming service...' : 'Uploading...'}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isUploading}
                >
                  {isUploading ? 
                    (contentType === 'video' ? 'Uploading to Stream...' : 'Uploading...') : 
                    'Upload'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LessonEditModal({
  isOpen,
  onClose,
  lesson,
  onSave,
  courseId
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
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Content editing states
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [newContentTitle, setNewContentTitle] = useState('');
  const [newContentUrl, setNewContentUrl] = useState('');
  const [newContentType, setNewContentType] = useState<'video' | 'image' | 'link' | 'pdf'>('video');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Assignments and Quizzes states
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [linkedAssignments, setLinkedAssignments] = useState<string[]>([]);
  const [linkedQuizzes, setLinkedQuizzes] = useState<string[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  
  // Description textarea ref for auto-resize
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea function
  const adjustTextareaHeight = () => {
    const textarea = descriptionTextareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set the height to match the scrollHeight, with min and max constraints
      const newHeight = Math.max(120, Math.min(textarea.scrollHeight, 400));
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Fetch courseId from chapterId if needed
  const fetchCourseIdFromChapter = async (chapterId: string): Promise<string | null> => {
    try {
      
      const response = await fetch(`/api/chapters/${chapterId}`);
      if (response.ok) {
        const chapter = await response.json();
        return chapter.courseId;
      } else {
        console.error('Failed to fetch chapter:', response.status, response.statusText);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      return null;
    }
  };

  // Fetch available assignments and quizzes
  const fetchAvailableAssignmentsAndQuizzes = async () => {
    // Try to get courseId from props first
    let courseIdToUse = courseId;

    // If no courseId from props, try lesson.courseId
    if (!courseIdToUse && lesson.courseId) {
      courseIdToUse = lesson.courseId;
    }
    
    // If still no courseId, try to get it from chapterId
    if (!courseIdToUse && lesson.chapterId) {
      const fetchedCourseId = await fetchCourseIdFromChapter(lesson.chapterId);
      if (fetchedCourseId) {
        courseIdToUse = fetchedCourseId;
      } else {
        console.warn('Could not fetch courseId from chapterId');
      }
    }
    
    if (!courseIdToUse) {
      console.error('No courseId available - cannot filter assignments/quizzes properly');
      // We'll still try to fetch all and show a warning
    }
    
    try {
      setLoadingAssignments(true);
      setLoadingQuizzes(true);

      // Fetch assignments
      let assignmentsResult;
      
      if (courseIdToUse) {
        assignmentsResult = await assignmentAPI.getAll(courseIdToUse);
      } else {
        assignmentsResult = await assignmentAPI.getAll();
      }
      
      
      if (assignmentsResult.success && assignmentsResult.data) {
        
        // Filter assignments: show unlinked ones OR ones linked to current lesson
        // Only show assignments that belong to the correct course
        const assignments = (assignmentsResult.data || []).filter((assignment: Assignment) => {
          const isUnlinked = !assignment.lessonId;
          const isLinkedToCurrentLesson = assignment.lessonId === lesson._id;
          
          // IMPORTANT: Only show assignments that belong to the correct course
          const matchesCourse = courseIdToUse ? assignment.courseId === courseIdToUse : true;
          
          const shouldShow = matchesCourse && (isUnlinked || isLinkedToCurrentLesson);
          
          return shouldShow;
        });
        
        setAvailableAssignments(assignments);
      } else {
        console.error('Failed to fetch assignments:', assignmentsResult.error);
        setAvailableAssignments([]);
      }

      // Fetch quizzes with same logic
      let quizzesResult;
      
      if (courseIdToUse) {
        quizzesResult = await quizAPI.getAll(courseIdToUse);
      } else {
        quizzesResult = await quizAPI.getAll();
      }
      
      if (quizzesResult.success && quizzesResult.data) {
        
        // Filter quizzes: show unlinked ones OR ones linked to current lesson
        // Only show quizzes that belong to the correct course
        const quizzes = (quizzesResult.data || []).filter((quiz: Quiz) => {
          const isUnlinked = !quiz.lessonId;
          const isLinkedToCurrentLesson = quiz.lessonId === lesson._id;
          
          // IMPORTANT: Only show quizzes that belong to the correct course
          const matchesCourse = courseIdToUse ? quiz.courseId === courseIdToUse : true;
          
          const shouldShow = matchesCourse && (isUnlinked || isLinkedToCurrentLesson);
          
          return shouldShow;
        });
        
        setAvailableQuizzes(quizzes);
      } else {
        console.error('Failed to fetch quizzes:', quizzesResult.error);
        setAvailableQuizzes([]);
      }
    } catch (error) {
      console.error('Error fetching assignments and quizzes:', error);
      setAvailableAssignments([]);
      setAvailableQuizzes([]);
    } finally {
      setLoadingAssignments(false);
      setLoadingQuizzes(false);
    }
  };

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
      setLessonContents(lesson.lessonContents ? [...lesson.lessonContents] : []);
      setLinkedAssignments(lesson.assignments || []);
      setLinkedQuizzes(lesson.quizzes || []);

      // Fetch available assignments and quizzes when lesson changes
      fetchAvailableAssignmentsAndQuizzes();
    } else {
      console.log('No lesson data provided');
    }
  }, [lesson]);

  // Focus on title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Auto-resize description textarea when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [lessonDescription]);

  // Also add debugging to track when the assignments-quizzes tab is clicked
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'assignments-quizzes') {
      fetchAvailableAssignmentsAndQuizzes();
    }
  };


  const handleSaveLesson = async () => {
    if (lessonTitle.trim()) {
      try {
        setIsUpdating(true);
        
        const updatedLessonData = {
          title: lessonTitle,
          titleDescription,
          description: lessonDescription,
          duration: lessonDuration,
          isPublished,
          isLive,
          liveScheduleDate: isLive ? liveScheduleDate : undefined,
          liveScheduleTime: isLive ? liveScheduleTime : undefined,
          liveScheduleLink: isLive ? liveScheduleLink : undefined,
          timezone: isLive ? timezone : undefined,
          lessonContents: lessonContents,
          assignments: linkedAssignments,
          quizzes: linkedQuizzes,
        };

        await onSave(updatedLessonData);
        onClose();
      } catch (error) {
        console.error('Error updating lesson:', error);
        // You could show an error message to the user here
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleAddContent = () => {
    if (newContentTitle.trim() && newContentUrl.trim()) {
      const newContent: LessonContent = {
        id: Date.now().toString(),
        title: newContentTitle,
        url: newContentUrl,
        type: newContentType,
        order: lessonContents.length,
      };
      
      setLessonContents([...lessonContents, newContent]);
      setNewContentTitle('');
      setNewContentUrl('');
      setNewContentType('video');
    }
  };

  const handleEditContent = (contentId: string) => {
    const content = lessonContents.find(c => c.id === contentId);
    if (content) {
      setEditingContentId(contentId);
      setNewContentTitle(content.title);
      setNewContentUrl(content.url);
      setNewContentType(content.type);
    }
  };

  const handleUpdateContent = () => {
    if (editingContentId && newContentTitle.trim() && newContentUrl.trim()) {
      setLessonContents(contents => 
        contents.map(content => 
          content.id === editingContentId 
            ? { ...content, title: newContentTitle, url: newContentUrl, type: newContentType }
            : content
        )
      );
      setEditingContentId(null);
      setNewContentTitle('');
      setNewContentUrl('');
      setNewContentType('video');
    }
  };

  const handleDeleteContent = (contentId: string) => {
    setLessonContents(contents => contents.filter(content => content.id !== contentId));
  };

  const handleUploadSuccess = (url: string) => {
    setNewContentUrl(url);
    setShowUploadModal(false);
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  // Assignment and Quiz management functions
  const handleToggleAssignment = (assignmentId: string) => {
    setLinkedAssignments(prev => 
      prev.includes(assignmentId) 
        ? prev.filter(id => id !== assignmentId)
        : [...prev, assignmentId]
    );
  };

  const handleToggleQuiz = (quizId: string) => {
    setLinkedQuizzes(prev => 
      prev.includes(quizId) 
        ? prev.filter(id => id !== quizId)
        : [...prev, quizId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Edit Lesson</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            disabled={isUpdating}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('basic')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'basic'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => handleTabChange('content')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Content ({lessonContents.length})
          </button>
          <button
            onClick={() => handleTabChange('assignments-quizzes')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'assignments-quizzes'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Assignments & Quizzes ({linkedAssignments.length + linkedQuizzes.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6">
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
                  
                  {/* Description Input */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-2">
                      Description (Markdown & LaTeX supported)
                    </label>
                    <textarea
                      id="edit-lesson-description"
                      value={lessonDescription}
                      onChange={(e) => {
                        setLessonDescription(e.target.value);
                        // Trigger auto-resize after state update
                        setTimeout(adjustTextareaHeight, 0);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none font-mono overflow-y-auto"
                      style={{ minHeight: '120px', maxHeight: '400px' }}
                      placeholder="Enter lesson description (Markdown & LaTeX supported)&#10;&#10;Use $math$ for inline equations or $$math$$ for block equations.&#10;Example: $x = y + z$ or $$\\int x dx = \\frac{x^2}{2} + C$$"
                      disabled={isUpdating}
                      ref={descriptionTextareaRef}
                      onInput={adjustTextareaHeight}
                    />
                  </div>
                  
                  {/* LaTeX Preview */}
                  {lessonDescription && (
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 mb-2">
                        Preview
                      </label>
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 shadow-inner max-h-64 overflow-y-auto prose prose-sm max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeRaw, rehypeKatex]}
                          components={{
                            h1: ({children}) => <h1 className="text-lg font-bold text-gray-800 mb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-semibold text-gray-800 mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-medium text-gray-800 mb-1">{children}</h3>,
                            p: ({children}) => <p className="text-gray-700 mb-2 leading-relaxed">{children}</p>,
                            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                            ul: ({children}) => <ul className="list-disc list-inside text-gray-700 mb-2 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside text-gray-700 mb-2 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-gray-700">{children}</li>,
                            a: ({href, children}) => (
                              <a 
                                href={href} 
                                className="text-blue-600 hover:text-blue-800 underline" 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            code: ({children}) => (
                              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({children}) => (
                              <pre className="bg-gray-100 text-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                {children}
                              </pre>
                            ),
                            blockquote: ({children}) => (
                              <blockquote className="border-l-4 border-gray-300 pl-3 italic text-gray-600 mb-2">
                                {children}
                              </blockquote>
                            )
                          }}
                          children={lessonDescription}
                        />
                      </div>
                    </div>
                  )}
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
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Add Content Form */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  {editingContentId ? 'Edit Content' : 'Add New Content'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Title
                    </label>
                    <input
                      type="text"
                      value={newContentTitle}
                      onChange={(e) => setNewContentTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      placeholder="e.g., Introduction Video"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content Type
                    </label>
                    <select
                      value={newContentType}
                      onChange={(e) => setNewContentType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    >
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="image">Image</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={newContentUrl}
                        onChange={(e) => setNewContentUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 pr-12"
                        placeholder={
                          newContentType === 'video' ? 'https://example.com/video' :
                          newContentType === 'image' ? 'https://example.com/image.jpg' :
                          newContentType === 'pdf' ? 'https://example.com/document.pdf' :
                          'https://example.com'
                        }
                      />
                      {newContentType !== 'link' && (
                        <button
                          type="button"
                          onClick={() => setShowUploadModal(true)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded cursor-pointer transition-colors"
                          title={`Upload ${newContentType}`}
                        >
                          <FiUpload size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end space-x-3">
                    {editingContentId && (
                      <button
                        onClick={() => {
                          setEditingContentId(null);
                          setNewContentTitle('');
                          setNewContentUrl('');
                          setNewContentType('video');
                        }}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={editingContentId ? handleUpdateContent : handleAddContent}
                      disabled={!newContentTitle.trim() || !newContentUrl.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <FiPlus size={16} />
                      <span>{editingContentId ? 'Update Content' : 'Add Content'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Current Content ({lessonContents.length})
                </h4>
                {lessonContents.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-8 text-center">
                    No content added yet. Add some content above to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {lessonContents.map((content, index) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-500 font-mono">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h5 className="text-sm font-medium text-gray-900">
                                {content.title}
                              </h5>
                              <p className="text-xs text-gray-500 capitalize">
                                {content.type} • {content.url}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditContent(content.id)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Edit content"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(content.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete content"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assignments-quizzes' && (
            <div className="space-y-6">
              {/* Assignments Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Available Assignments</h4>
                  <span className="text-sm text-gray-500">
                    {linkedAssignments.length} selected
                  </span>
                </div>

                {loadingAssignments ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableAssignments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiFileText size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No assignments available</p>
                    <p className="text-sm">Create assignments in the course to add them to this lesson</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableAssignments.map((assignment) => (
                      <div
                        key={assignment._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          linkedAssignments.includes(assignment._id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleToggleAssignment(assignment._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={linkedAssignments.includes(assignment._id)}
                                onChange={() => handleToggleAssignment(assignment._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <h5 className="font-medium text-gray-900">{assignment.title}</h5>
                                {assignment.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {assignment.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <FiCalendar size={12} />
                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiCheckSquare size={12} />
                                <span>{assignment.totalMarks} marks</span>
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.isPublished 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {assignment.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Quizzes Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">Available Quizzes</h4>
                  <span className="text-sm text-gray-500">
                    {linkedQuizzes.length} selected
                  </span>
                </div>

                {loadingQuizzes ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : availableQuizzes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FiCheckSquare size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No quizzes available</p>
                    <p className="text-sm">Create quizzes in the course to add them to this lesson</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableQuizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          linkedQuizzes.includes(quiz._id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleToggleQuiz(quiz._id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={linkedQuizzes.includes(quiz._id)}
                                onChange={() => handleToggleQuiz(quiz._id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <h5 className="font-medium text-gray-900">{quiz.title}</h5>
                                {quiz.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {quiz.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <FiClock size={12} />
                                <span>{quiz.duration} min</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiCheckSquare size={12} />
                                <span>{quiz.totalQuestions} questions</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiUser size={12} />
                                <span>{quiz.totalMarks} marks</span>
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                quiz.isPublished 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {quiz.isPublished ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {(linkedAssignments.length > 0 || linkedQuizzes.length > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Selected Items Summary</h5>
                  <div className="space-y-2">
                    {linkedAssignments.length > 0 && (
                      <p className="text-sm text-blue-700">
                        <strong>{linkedAssignments.length}</strong> assignment{linkedAssignments.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                    {linkedQuizzes.length > 0 && (
                      <p className="text-sm text-blue-700">
                        <strong>{linkedQuizzes.length}</strong> quiz{linkedQuizzes.length !== 1 ? 'zes' : ''} selected
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveLesson}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={isUpdating || !lessonTitle.trim()}
          >
            {isUpdating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <FiSave size={16} />
            <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          contentType={newContentType}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
} 