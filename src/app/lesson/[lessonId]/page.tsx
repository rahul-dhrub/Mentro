'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FiPlay, FiFile, FiExternalLink, FiClock, FiCalendar, FiDownload } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface LessonContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'link' | 'pdf' | 'document';
  order: number;
}

interface Lesson {
  _id: string;
  title: string;
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

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<LessonContent | null>(null);

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

  const handleContentSelect = (content: LessonContent) => {
    setSelectedContent(content);
  };

  const renderContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FiPlay className="w-5 h-5 text-red-500" />;
      case 'pdf':
      case 'document':
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
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiPlay className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedContent.title}</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Click the button below to open this video in a new tab
              </p>
              <a
                href={selectedContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors text-lg font-medium"
              >
                <FiExternalLink className="w-5 h-5" />
                <span>Open Video in New Tab</span>
              </a>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
                <p className="text-xs text-blue-600">
                  <strong>Supports:</strong> MP4, WebM, MOV, AVI, MKV, HLS, DASH, YouTube, Vimeo, and more
                </p>
              </div>
            </div>
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
      case 'document':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFile className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedContent.title}</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Click the button below to open this {selectedContent.type.toUpperCase()} document in a new tab
              </p>
              <div className="space-y-3">
                <a
                  href={selectedContent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
                >
                  <FiExternalLink className="w-5 h-5" />
                  <span>Open {selectedContent.type.toUpperCase()} in New Tab</span>
                </a>
                <div className="flex items-center justify-center space-x-4">
                  <a
                    href={selectedContent.url}
                    download
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 max-w-md mx-auto">
                <p className="text-xs text-green-600">
                  <strong>Tip:</strong> Most browsers can display PDFs directly. For other document types, you may need appropriate software installed.
                </p>
              </div>
            </div>
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
            onClick={() => window.history.back()}
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              {lesson.description && (
                <div className="text-gray-600 mb-4 prose prose-gray max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 