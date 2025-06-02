import React from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface CourseHeaderProps {
  title: string;
  description: string;
  thumbnail: string;
  onEditCourse: () => void;
}

export default function CourseHeader({ 
  title, 
  description, 
  thumbnail, 
  onEditCourse 
}: CourseHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative h-20 w-20 rounded-lg overflow-hidden">
              <Image
                src={thumbnail}
                alt="Course thumbnail"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <div className="text-gray-600 prose prose-sm prose-gray max-w-none">
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
                  {description || ''}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          <button 
            onClick={onEditCourse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
} 