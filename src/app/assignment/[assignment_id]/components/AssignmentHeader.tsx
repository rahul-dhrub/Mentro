import React from 'react';
import { FiBookOpen, FiClock, FiCalendar, FiUser, FiEdit2, FiUpload, FiSave } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  content: string;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  courseId?: {
    _id: string;
    title: string;
  };
  courseName?: string;
}

interface AssignmentHeaderProps {
  assignment: Assignment;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  editDueDate: string;
  editTotalMarks: string;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onEditDueDateChange: (value: string) => void;
  onEditTotalMarksChange: (value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onShowSubmissionModal: () => void;
}

const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  assignment,
  isEditing,
  editTitle,
  editDescription,
  editDueDate,
  editTotalMarks,
  onEditTitleChange,
  onEditDescriptionChange,
  onEditDueDateChange,
  onEditTotalMarksChange,
  onEdit,
  onCancel,
  onSave,
  onShowSubmissionModal
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <FiBookOpen className="mr-2" size={16} />
            <span>{assignment.courseId?.title || assignment.courseName || 'Course'}</span>
          </div>
          
          {isEditing ? (
            <div className="space-y-4 pr-6">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => onEditTitleChange(e.target.value)}
                  className="w-full px-3 py-2 text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter assignment title"
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => onEditDescriptionChange(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
                  placeholder="Enter assignment description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-due-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    id="edit-due-date"
                    type="date"
                    value={editDueDate}
                    onChange={(e) => onEditDueDateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  />
                </div>
                <div>
                  <label htmlFor="edit-total-marks" className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    id="edit-total-marks"
                    type="number"
                    min="1"
                    value={editTotalMarks}
                    onChange={(e) => onEditTotalMarksChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    placeholder="e.g. 100"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
              <div className="text-gray-600 text-lg prose prose-lg max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex]}
                  components={{
                    p: ({children}) => <p className="text-gray-600 text-lg mb-2">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-gray-700">{children}</strong>,
                    em: ({children}) => <em className="italic text-gray-600">{children}</em>,
                    code: ({children}) => (
                      <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-base font-mono">
                        {children}
                      </code>
                    ),
                    a: ({href, children}) => (
                      <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    ul: ({children}) => <ul className="list-disc list-inside text-gray-600 text-lg">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside text-gray-600 text-lg">{children}</ol>,
                    li: ({children}) => <li className="text-gray-600 text-lg">{children}</li>,
                    h1: ({children}) => <h1 className="text-xl font-bold text-gray-700 mb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-lg font-semibold text-gray-700 mb-2">{children}</h2>,
                    h3: ({children}) => <h3 className="text-base font-semibold text-gray-700 mb-1">{children}</h3>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-500">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {assignment.description}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-6 ml-6">
          {!isEditing && (
            <div className="text-right">
              <div className="flex items-center text-gray-500 mb-2">
                <FiClock className="mr-2" />
                <span className="font-medium">{assignment.totalMarks} marks</span>
              </div>
              <div className="flex items-center text-gray-500 mb-2">
                <FiCalendar className="mr-2" />
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <FiUser className="mr-2" />
                <span>{assignment.submissions} submissions</span>
              </div>
            </div>
          )}
          {!isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiEdit2 size={18} />
                <span>Edit Assignment</span>
              </button>
              <button
                onClick={onShowSubmissionModal}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FiUpload size={18} />
                <span>Submit Assignment</span>
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={!editTitle.trim() || !editDueDate || !editTotalMarks}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                  editTitle.trim() && editDueDate && editTotalMarks
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <FiSave size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentHeader; 