'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiPlay, FiFile, FiExternalLink, FiClock, FiCalendar, FiDownload, FiEdit2, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import LessonEditModal from './components/LessonEditModal';

interface LessonContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'link' | 'pdf';
  order: number;
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
  createdAt: string;
  updatedAt: string;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  width?: string;
  height?: string;
}

interface PDFViewerProps {
  src: string;
  title?: string;
  width?: string;
  height?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  title = "Video Player",
  width = "100%",
  height = "100%"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="video-player-container w-full h-full">
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-sm">Loading video...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load video</p>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mr-2"
                >
                  Retry
                </button>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </a>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={src}
          title={title}
          width={width}
          height={height}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full rounded-lg shadow-lg transition-opacity duration-300 ${
            isLoading || hasError ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    </div>
  );
};

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  src, 
  title = "PDF Viewer",
  width = "100%",
  height = "100%"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const refreshPDF = () => {
    setHasError(false);
    setIsLoading(true);
  };

  return (
    <div className="pdf-viewer-container w-full h-full">
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-sm">Loading PDF document...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <FiFile className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Failed to load PDF document</p>
              <div className="space-y-2">
                <button 
                  onClick={refreshPDF}
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mr-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </a>
                <a
                  href={src}
                  download
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
                <p className="text-xs text-yellow-600">
                  <strong>Note:</strong> Some browsers may block PDF display. Try downloading or opening in a new tab.
                </p>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={src}
          title={title}
          width={width}
          height={height}
          frameBorder="0"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full rounded-lg shadow-lg transition-opacity duration-300 ${
            isLoading || hasError ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    </div>
  );
};

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<LessonContent | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }
      
      const data = await response.json();
      console.log(data);
      setLesson(data);
      
      // Auto-select first content if available
      if (data.lessonContents && data.lessonContents.length > 0) {
        setSelectedContent(data.lessonContents[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLesson = async (updatedLessonData: Partial<Lesson>) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLessonData),
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }

      const updatedLesson = await response.json();
      setLesson(updatedLesson);
      
      // Update selected content if it was modified
      if (updatedLesson.lessonContents && updatedLesson.lessonContents.length > 0) {
        const currentSelectedId = selectedContent?.id;
        const updatedSelectedContent = updatedLesson.lessonContents.find(
          (content: LessonContent) => content.id === currentSelectedId
        );
        if (updatedSelectedContent) {
          setSelectedContent(updatedSelectedContent);
        } else {
          setSelectedContent(updatedLesson.lessonContents[0]);
        }
      } else {
        setSelectedContent(null);
      }
    } catch (error) {
      console.error('Error saving lesson:', error);
      throw error;
    }
  };

  const handleContentSelect = (content: LessonContent) => {
    setSelectedContent(content);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/'); // Fallback to home page
    }
  };

  const renderContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FiPlay className="w-5 h-5 text-red-500" />;
      case 'pdf':
        return <FiFile className="w-5 h-5 text-blue-500" />;
      case 'link':
        return <FiExternalLink className="w-5 h-5 text-green-500" />;
      case 'image':
        return <FiFile className="w-5 h-5 text-purple-500" />;
      default:
        return <FiFile className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderMainContent = () => {
    if (!selectedContent) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center">
            <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select content to view</p>
          </div>
        </div>
      );
    }

    switch (selectedContent.type) {
      case 'video':
        return (
          <div className="w-full h-full">
            <VideoPlayer 
              src={selectedContent.url}
              title={selectedContent.title}
              height="100%"
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={selectedContent.url}
              alt={selectedContent.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-center text-gray-600';
                errorDiv.innerHTML = `
                  <div class="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <p>Unable to load image</p>
                  <a href="${selectedContent.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline mt-2 inline-block">Open in New Tab</a>
                `;
                e.currentTarget.parentNode?.appendChild(errorDiv);
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-full">
            <PDFViewer 
              src={selectedContent.url}
              title={selectedContent.title}
              height="100%"
            />
          </div>
        );
      
      case 'link':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiExternalLink className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedContent.title}</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Click the button below to visit this external link
              </p>
              <a
                href={selectedContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
              >
                <FiExternalLink className="w-5 h-5" />
                <span>Visit Link</span>
              </a>
              <p className="text-xs text-gray-500 mt-4 break-all max-w-md mx-auto">
                {selectedContent.url}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-gray-600">Content type not supported</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Lesson not found'}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Back Button */}
              <button
                onClick={handleGoBack}
                className="mt-1 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                title="Go back"
              >
                <FiArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                {lesson.titleDescription && (
                  <p className="text-lg text-gray-700 mb-3 font-medium">
                    {lesson.titleDescription}
                  </p>
                )}
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-4 h-4" />
                    <span>{lesson.duration}</span>
                  </div>
                  {lesson.isLive && lesson.liveScheduleDate && (
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>Live: {lesson.liveScheduleDate} at {lesson.liveScheduleTime}</span>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lesson.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {lesson.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowEditModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiEdit2 className="w-4 h-4" />
                <span>Edit Lesson</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Content Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lesson Content</h3>
              <div className="space-y-2">
                {lesson.lessonContents.map((content, index) => (
                  <button
                    key={content.id}
                    onClick={() => handleContentSelect(content)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedContent?.id === content.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {renderContentIcon(content.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {content.title}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {content.type}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                
                {lesson.lessonContents.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No content available</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedContent ? selectedContent.title : 'Content Viewer'}
                </h3>
                {selectedContent && selectedContent.type === 'pdf' && (
                  <a
                    href={selectedContent.url}
                    download
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                )}
              </div>
              <div className="h-96 lg:h-[600px]">
                {renderMainContent()}
              </div>
              {lesson.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                  <div className="text-gray-600 mb-4 prose prose-gray max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeRaw, rehypeKatex]}
                      components={{
                        // Custom styling for markdown elements
                        h1: ({children}) => <h1 className="text-2xl font-bold text-gray-800 mb-3">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-semibold text-gray-800 mb-2">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mb-2">{children}</h3>,
                        p: ({children}) => <p className="text-gray-600 mb-2">{children}</p>,
                        strong: ({children}) => <strong className="font-semibold text-gray-800">{children}</strong>,
                        em: ({children}) => <em className="italic text-gray-700">{children}</em>,
                        u: ({children}) => <u className="underline text-gray-700">{children}</u>,
                        ul: ({children}) => <ul className="list-disc list-inside text-gray-600 mb-2">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal list-inside text-gray-600 mb-2">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
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
                          <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                        pre: ({children}) => (
                          <pre className="bg-gray-100 text-gray-800 p-3 rounded text-sm font-mono overflow-x-auto mb-3">
                            {children}
                          </pre>
                        ),
                        blockquote: ({children}) => (
                          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
                            {children}
                          </blockquote>
                        ),
                        table: ({children}) => (
                          <table className="min-w-full divide-y divide-gray-200 mb-3">
                            {children}
                          </table>
                        ),
                        thead: ({children}) => (
                          <thead className="bg-gray-50">
                            {children}
                          </thead>
                        ),
                        tbody: ({children}) => (
                          <tbody className="bg-white divide-y divide-gray-200">
                            {children}
                          </tbody>
                        ),
                        th: ({children}) => (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {children}
                          </th>
                        ),
                        td: ({children}) => (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {children}
                          </td>
                        ),
                        // Support additional HTML tags
                        mark: ({children}) => <mark className="bg-yellow-200 text-gray-800 px-1 rounded">{children}</mark>,
                        del: ({children}) => <del className="line-through text-gray-500">{children}</del>,
                        ins: ({children}) => <ins className="underline decoration-green-500 text-gray-700">{children}</ins>,
                        sub: ({children}) => <sub className="text-xs align-sub">{children}</sub>,
                        sup: ({children}) => <sup className="text-xs align-super">{children}</sup>,
                      }}
                    >
                      {lesson.description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showEditModal && (
        <LessonEditModal
          isOpen={showEditModal}
          lesson={lesson}
          onSave={handleSaveLesson}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
} 