import React from 'react';
import Link from 'next/link';
import { FiChevronDown, FiClock, FiEdit2, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Chapter, Lesson } from '../types';
import LessonCompletionDropdown, { LessonStatus } from '@/components/ui/LessonCompletionDropdown';

interface ChapterItemProps {
  chapter: Chapter;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  getLessonStatus: (lessonId: string) => LessonStatus;
  onLessonStatusChange: (lessonId: string, chapterId: string, status: LessonStatus) => void;
  progressLoading?: boolean;
}

export default function ChapterItem({ 
  chapter, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  getLessonStatus,
  onLessonStatusChange,
  progressLoading = false
}: ChapterItemProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-visible">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={onToggle}
              className="text-gray-500 hover:text-gray-700 transition-transform cursor-pointer"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <FiChevronDown size={20} />
            </button>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{chapter.title}</h3>
              <div className="text-gray-600 mt-1 prose prose-sm prose-gray max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    p: ({children}) => <p className="text-gray-600 mb-1">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-gray-700">{children}</strong>,
                    em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                    u: ({children}) => <u className="underline text-gray-600">{children}</u>,
                    a: ({href, children}) => (
                      <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    code: ({children}) => (
                      <code className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    ul: ({children}) => <ul className="list-disc list-inside text-gray-600">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside text-gray-600">{children}</ol>,
                    li: ({children}) => <li className="text-gray-600">{children}</li>,
                    h1: ({children}) => <h1 className="text-base font-semibold text-gray-700 mb-1">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-semibold text-gray-700 mb-1">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-semibold text-gray-700 mb-1">{children}</h3>,
                    mark: ({children}) => <mark className="bg-yellow-200 text-gray-700 px-1 rounded">{children}</mark>,
                    del: ({children}) => <del className="line-through text-gray-500">{children}</del>,
                    ins: ({children}) => <ins className="underline decoration-green-500 text-gray-600">{children}</ins>,
                  }}
                >
                  {chapter.description || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 flex items-center">
              <FiClock className="mr-1" />
              {chapter.duration}
            </span>
            <button onClick={onEdit} className="text-blue-600 hover:text-blue-900 cursor-pointer">
              <FiEdit2 size={18} />
            </button>
            <button onClick={onDelete} className="text-red-600 hover:text-red-900 cursor-pointer">
              <FiTrash2 size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Lessons Section */}
      {isExpanded && (
        <div className="px-6 py-4 pb-8 overflow-visible">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-medium text-gray-900">Lessons</h4>
            <button
              onClick={onAddLesson}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm cursor-pointer"
            >
              <FiPlus size={16} />
              <span>Add Lesson</span>
            </button>
          </div>
          <div className="space-y-6 overflow-visible">
            {chapter.lessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className={`
                  bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors overflow-visible relative
                  ${index === chapter.lessons.length - 1 ? 'mb-20' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/lesson/${lesson._id || lesson.id}`}
                      className="block hover:text-blue-600 transition-colors"
                    >
                      <h5 className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                        {lesson.title}
                      </h5>
                      <div className="text-sm text-gray-600 mt-1 prose prose-sm prose-gray max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={{
                            p: ({children}) => <p className="text-sm text-gray-600 mb-1">{children}</p>,
                            strong: ({children}) => <strong className="font-medium text-gray-700">{children}</strong>,
                            em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                            u: ({children}) => <u className="underline text-gray-600">{children}</u>,
                            a: ({href, children}) => (
                              <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                            code: ({children}) => (
                              <code className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            ul: ({children}) => <ul className="list-disc list-inside text-sm text-gray-600">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside text-sm text-gray-600">{children}</ol>,
                            li: ({children}) => <li className="text-sm text-gray-600">{children}</li>,
                            h1: ({children}) => <h1 className="text-sm font-medium text-gray-700 mb-1">{children}</h1>,
                            h2: ({children}) => <h2 className="text-sm font-medium text-gray-700 mb-1">{children}</h2>,
                            h3: ({children}) => <h3 className="text-xs font-medium text-gray-700 mb-1">{children}</h3>,
                            mark: ({children}) => <mark className="bg-yellow-200 text-gray-700 px-1 rounded">{children}</mark>,
                            del: ({children}) => <del className="line-through text-gray-500">{children}</del>,
                            ins: ({children}) => <ins className="underline decoration-green-500 text-gray-600">{children}</ins>,
                          }}
                        >
                          {lesson.description || ''}
                        </ReactMarkdown>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Right side with completion dropdown and action buttons */}
                  <div className="flex items-center space-x-3 ml-4">
                    {/* Lesson Completion Dropdown */}
                    <LessonCompletionDropdown
                      lessonId={lesson._id || lesson.id}
                      currentStatus={getLessonStatus(lesson._id || lesson.id)}
                      onStatusChange={(lessonId, status) => onLessonStatusChange(lessonId, chapter.id, status)}
                      disabled={progressLoading}
                      size="small"
                    />
                    
                    {/* Duration */}
                    <span className="text-xs text-gray-500 flex items-center whitespace-nowrap">
                      <FiClock className="mr-1" />
                      {lesson.duration}
                    </span>
                    
                    {/* Published Status */}
                    <span className={`text-xs whitespace-nowrap ${lesson.isPublished ? 'text-green-600' : 'text-yellow-600'}`}>
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </span>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Link 
                        href={`/lesson/${lesson._id || lesson.id}`}
                        className="text-gray-600 hover:text-gray-900 cursor-pointer"
                        title="View Lesson"
                      >
                        <FiEye size={16} />
                      </Link>
                      <button 
                        onClick={() => onDeleteLesson(lesson.id)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Delete Lesson"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Lesson metadata */}
                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  <span>{lesson.assignments?.length || 0} Assignments</span>
                  <span>{lesson.quizzes?.length || 0} Quizzes</span>
                  {lesson.lessonContents && lesson.lessonContents.length > 0 && (
                    <span>{lesson.lessonContents.length} Content Items</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 