import { FiStar, FiClock, FiUsers, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Course } from '../types';

interface CourseHeaderProps {
  course: Course;
  userRole?: string;
  onPublishClick?: () => void;
  onUnpublishClick?: () => void;
  onDeleteClick?: () => void;
  isPublishing?: boolean;
  isUnpublishing?: boolean;
  isDeleting?: boolean;
}

export default function CourseHeader({ 
  course, 
  userRole, 
  onPublishClick, 
  onUnpublishClick, 
  onDeleteClick, 
  isPublishing = false,
  isUnpublishing = false,
  isDeleting = false
}: CourseHeaderProps) {
  // Check if user can manage this course
  const canManage = userRole && (userRole.toLowerCase() === 'instructor' || userRole.toLowerCase() === 'admin');
  const isDraft = !course.isPublished;
  const isPublished = course.isPublished;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Course Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{course.title}</h1>
              
              {/* Status Tag and Action Buttons */}
              <div className="flex items-center gap-3 ml-4">
                {/* Status Tag */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isDraft
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`}
                >
                  {isDraft ? (
                    <>
                      <FiEyeOff className="w-4 h-4 mr-1.5" />
                      Draft
                    </>
                  ) : (
                    <>
                      <FiEye className="w-4 h-4 mr-1.5" />
                      Published
                    </>
                  )}
                </span>

                {/* Action Buttons - Only show for authorized users */}
                {canManage && (
                  <div className="flex items-center gap-2">
                    {/* Publish Button - Only show for drafts */}
                    {isDraft && onPublishClick && (
                      <button
                        onClick={onPublishClick}
                        disabled={isPublishing || isDeleting}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isPublishing || isDeleting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                        }`}
                      >
                        {isPublishing ? (
                          <>
                            <div className="animate-spin w-4 h-4 mr-1.5 border-2 border-white border-t-transparent rounded-full"></div>
                            Publishing...
                          </>
                        ) : (
                          <>
                            <FiEye className="w-4 h-4 mr-1.5" />
                            Publish
                          </>
                        )}
                      </button>
                    )}

                    {/* Unpublish Button - Only show for published courses */}
                    {isPublished && onUnpublishClick && (
                      <button
                        onClick={onUnpublishClick}
                        disabled={isUnpublishing}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isUnpublishing
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-yellow-600 text-white hover:bg-yellow-700 cursor-pointer'
                        }`}
                      >
                        {isUnpublishing ? (
                          <>
                            <div className="animate-spin w-4 h-4 mr-1.5 border-2 border-white border-t-transparent rounded-full"></div>
                            Unpublishing...
                          </>
                        ) : (
                          <>
                            <FiEyeOff className="w-4 h-4 mr-1.5" />
                            Unpublish
                          </>
                        )}
                      </button>
                    )}

                    {/* Delete Button - Only show for draft courses */}
                    {isDraft && onDeleteClick && (
                      <button
                        onClick={onDeleteClick}
                        disabled={isDeleting || isPublishing}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isDeleting || isPublishing
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                        }`}
                        title="Delete Course"
                      >
                        {isDeleting ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          <FiTrash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="text-lg text-gray-800 mb-6 prose prose-gray max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({children}) => <p className="text-lg text-gray-800 mb-2">{children}</p>,
                  strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                  em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                  u: ({children}) => <u className="underline text-gray-800">{children}</u>,
                  a: ({href, children}) => (
                    <a href={href} className="text-blue-600 hover:text-blue-800 underline cursor-pointer" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  code: ({children}) => (
                    <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-base font-mono">
                      {children}
                    </code>
                  ),
                  ul: ({children}) => <ul className="list-disc list-inside text-lg text-gray-800">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal list-inside text-lg text-gray-800">{children}</ol>,
                  li: ({children}) => <li className="text-lg text-gray-800">{children}</li>,
                  h1: ({children}) => <h1 className="text-xl font-semibold text-gray-900 mb-2">{children}</h1>,
                  h2: ({children}) => <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>,
                  h3: ({children}) => <h3 className="text-base font-semibold text-gray-900 mb-1">{children}</h3>,
                  mark: ({children}) => <mark className="bg-yellow-200 text-gray-800 px-1 rounded">{children}</mark>,
                  del: ({children}) => <del className="line-through text-gray-600">{children}</del>,
                  ins: ({children}) => <ins className="underline decoration-green-500 text-gray-800">{children}</ins>,
                }}
              >
                {course.description || ''}
              </ReactMarkdown>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-700 mb-6">
              <div className="flex items-center">
                <FiStar className="text-yellow-400 mr-1" />
                <span>{course.rating.toFixed(1)} rating</span>
                <span className="mx-1">•</span>
                <span>{course.reviews.toLocaleString()} reviews</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="mr-1" />
                <span>{course.students.toLocaleString()} students</span>
              </div>
              <div className="flex items-center">
                <FiClock className="mr-1" />
                <span>Last updated {new Date(course.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center">
              <img
                src={course.instructor.image}
                alt={course.instructor.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-medium text-gray-900">{course.instructor.name}</p>
                <p className="text-sm text-gray-700">
                  {course.instructor.rating.toFixed(1)} Instructor Rating • {course.instructor.reviews.toLocaleString()} Reviews
                </p>
              </div>
            </div>
          </div>

          {/* Course Preview */}
          <div className="w-full md:w-96">
            <div className="aspect-video relative rounded-lg overflow-hidden mb-4">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 