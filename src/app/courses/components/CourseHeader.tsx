import { FiStar, FiClock, FiUsers } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Course } from '../types';

interface CourseHeaderProps {
  course: Course;
}

export default function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Course Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
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