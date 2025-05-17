'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiEye, FiEdit2, FiClock, FiCalendar, FiPaperclip, FiFile, FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import katex from 'katex';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  content: string;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  attachments: Attachment[];
}

export default function AssignmentDetail() {
  const [isPreview, setIsPreview] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [assignment, setAssignment] = useState<Assignment>({
    id: '1',
    title: 'Mathematical Analysis Assignment',
    description: 'Solve the following problems using calculus',
    content: `# Problem 1
Find the derivative of the following function:

$$f(x) = \\frac{x^2 + 3x + 2}{x + 1}$$

# Problem 2
Evaluate the integral:

$$\\int_{0}^{\\pi} \\sin^2(x) \\, dx$$

# Problem 3
Solve the differential equation:

$$\\frac{dy}{dx} + 2y = e^{-x}$$

Show all your work and explain your steps.`,
    dueDate: '2024-04-01',
    totalMarks: 100,
    submissions: 0,
    attachments: []
  });

  useEffect(() => {
    // Initialize KaTeX for any math elements
    if (typeof window !== 'undefined') {
      const mathElements = document.querySelectorAll('.katex-mathml');
      mathElements.forEach((element) => {
        const mathText = element.textContent;
        if (mathText) {
          try {
            katex.render(mathText, element as HTMLElement, {
              throwOnError: false,
              displayMode: element.classList.contains('display')
            });
          } catch (e) {
            console.error('KaTeX rendering error:', e);
          }
        }
      });
    }
  }, [assignment.content]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setAssignment(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAssignment(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleContentChange = (value: string | undefined) => {
    if (value !== undefined) {
      setAssignment(prev => ({ ...prev, content: value }));
    }
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving assignment:', assignment);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
              <p className="text-gray-600 mt-1">{assignment.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-500">
                <FiClock className="mr-2" />
                <span>{assignment.totalMarks} marks</span>
              </div>
              <div className="flex items-center text-gray-500">
                <FiCalendar className="mr-2" />
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2">
              <FiPaperclip size={20} />
              <span>Add Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </label>
          </div>
          <div className="space-y-2">
            {assignment.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FiFile className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <FiEye size={18} />
                  </a>
                  <button
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            ))}
            {assignment.attachments.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No attachments added yet
              </p>
            )}
          </div>
        </div>

        {/* Editor/Preview Toggle */}
        <div className="flex justify-end mb-4 space-x-4">
          <button
            onClick={() => setIsFullPreview(!isFullPreview)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            {isFullPreview ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
            <span>{isFullPreview ? 'Split View' : 'Full Preview'}</span>
          </button>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            {isPreview ? <FiEdit2 size={20} /> : <FiEye size={20} />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>
        </div>

        {/* Editor/Preview Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`grid ${isFullPreview ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <div data-color-mode="light" className="border-r border-gray-200">
              <MDEditor
                value={assignment.content}
                onChange={handleContentChange}
                height={600}
                preview={isPreview ? 'preview' : 'edit'}
                hideToolbar={isPreview}
                enableScroll={true}
                className="!border-0"
                textareaProps={{
                  placeholder: 'Write your assignment content here...'
                }}
              />
            </div>
            {!isFullPreview && !isPreview && (
              <div className="p-4 overflow-auto" style={{ height: '600px' }}>
                <MDEditor
                  value={assignment.content}
                  preview="preview"
                  hideToolbar={true}
                  enableScroll={true}
                  className="!border-0"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FiSave size={20} />
            <span>Save Assignment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
