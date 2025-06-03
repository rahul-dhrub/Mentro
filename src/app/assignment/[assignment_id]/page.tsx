'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiEye, FiEdit2, FiClock, FiCalendar, FiPaperclip, FiFile, FiX, FiMaximize2, FiMinimize2, FiArrowLeft, FiUser, FiBookOpen } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { assignmentAPI } from '@/lib/api';

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
  _id: string;
  title: string;
  description: string;
  content: string;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  attachments: Attachment[];
  courseId?: {
    _id: string;
    title: string;
  };
  courseName?: string;
  isPublished: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AssignmentDetail() {
  const params = useParams();
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editTotalMarks, setEditTotalMarks] = useState('');
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      if (!params.assignment_id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await assignmentAPI.getById(params.assignment_id as string);
        
        if (result.success && result.data) {
          setAssignment(result.data as Assignment);
        } else {
          setError(result.error || 'Failed to fetch assignment');
        }
      } catch (err) {
        setError('Failed to fetch assignment');
        console.error('Error fetching assignment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [params.assignment_id]);

  useEffect(() => {
    // Initialize KaTeX for any math elements
    if (typeof window !== 'undefined' && assignment) {
      setTimeout(() => {
        renderLatexInContent();
      }, 100);
    }
  }, [assignment?.content, isPreview, isFullPreview]);

  const renderLatexInContent = () => {
    const contentElements = document.querySelectorAll('.assignment-content, .assignment-preview');
    
    contentElements.forEach((element) => {
      const textNodes: Text[] = [];
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';
        
        // Handle block math ($$...$$)
        if (text.includes('$$')) {
          const parts = text.split(/(.*?\$\$.*?\$\$.*?)/g);
          if (parts.length > 1) {
            const parent = textNode.parentNode;
            if (parent) {
              parts.forEach((part) => {
                if (part.includes('$$')) {
                  const mathMatch = part.match(/\$\$(.*?)\$\$/);
                  if (mathMatch) {
                    const mathDiv = document.createElement('div');
                    mathDiv.className = 'math-block';
                    mathDiv.style.textAlign = 'center';
                    mathDiv.style.margin = '1em 0';
                    try {
                      katex.render(mathMatch[1], mathDiv, {
                        throwOnError: false,
                        displayMode: true
                      });
                      parent.insertBefore(mathDiv, textNode);
                    } catch (e) {
                      mathDiv.textContent = part;
                      parent.insertBefore(mathDiv, textNode);
                    }
                  }
                } else if (part.trim()) {
                  parent.insertBefore(document.createTextNode(part), textNode);
                }
              });
              parent.removeChild(textNode);
            }
          }
        }
        // Handle inline math ($...$)
        else if (text.includes('$') && !text.includes('$$')) {
          const parts = text.split(/(\$[^$]+\$)/g);
          if (parts.length > 1) {
            const parent = textNode.parentNode;
            if (parent) {
              parts.forEach((part) => {
                if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                  const mathContent = part.slice(1, -1);
                  const mathSpan = document.createElement('span');
                  mathSpan.className = 'math-inline';
                  try {
                    katex.render(mathContent, mathSpan, {
                      throwOnError: false,
                      displayMode: false
                    });
                    parent.insertBefore(mathSpan, textNode);
                  } catch (e) {
                    mathSpan.textContent = part;
                    parent.insertBefore(mathSpan, textNode);
                  }
                } else if (part.trim()) {
                  parent.insertBefore(document.createTextNode(part), textNode);
                }
              });
              parent.removeChild(textNode);
            }
          }
        }
      });
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !assignment) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setAssignment(prev => prev ? ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }) : null);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAssignment(prev => prev ? ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }) : null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleContentChange = (value: string | undefined) => {
    if (value !== undefined && assignment) {
      setAssignment(prev => prev ? ({ ...prev, content: value }) : null);
    }
  };

  const handleSave = async () => {
    if (!assignment) return;
    
    try {
      const updateData = {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
        totalMarks: parseInt(editTotalMarks),
        content: assignment.content,
        attachments: assignment.attachments
      };

      const result = await assignmentAPI.update(assignment._id, updateData);
      
      if (result.success && result.data) {
        setAssignment(result.data as Assignment);
        setIsEditing(false);
        setError(null);
      } else {
        setError(result.error || 'Failed to update assignment');
      }
    } catch (err) {
      setError('Failed to update assignment');
      console.error('Error updating assignment:', err);
    }
  };

  const handleEdit = () => {
    if (!assignment) return;
    
    // Initialize edit form with current values
    setEditTitle(assignment.title);
    setEditDescription(assignment.description);
    setEditDueDate(assignment.dueDate.split('T')[0]);
    setEditTotalMarks(assignment.totalMarks.toString());
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset edit form values
    setEditTitle('');
    setEditDescription('');
    setEditDueDate('');
    setEditTotalMarks('');
    setIsEditing(false);
  };

  const handleGoBack = () => {
    if (assignment?.courseId?._id) {
      router.push(`/course_detail/${assignment.courseId._id}`);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading assignment...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">{error || 'Assignment not found'}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Header */}
        <div className="mb-6">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" size={20} />
            <span>Back to Course</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Header */}
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
                      onChange={(e) => setEditTitle(e.target.value)}
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
                      onChange={(e) => setEditDescription(e.target.value)}
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
                        onChange={(e) => setEditDueDate(e.target.value)}
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
                        onChange={(e) => setEditTotalMarks(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        placeholder="e.g. 100"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                  <p className="text-gray-600 text-lg">{assignment.description}</p>
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
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FiEdit2 size={18} />
                  <span>Edit Assignment</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
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

        {/* Attachments Section */}
        {(assignment.attachments.length > 0 || isEditing) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Attachments</h2>
              {isEditing && (
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
              )}
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
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiX size={18} />
                      </button>
                    )}
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
        )}

        {/* Editor/Preview Toggle */}
        {isEditing && (
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
        )}

        {/* Content Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isEditing ? (
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
                <div className="p-4 overflow-auto assignment-preview" style={{ height: '600px' }}>
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
          ) : (
            <div className="p-6 assignment-content prose prose-lg max-w-none">
              <MDEditor
                value={assignment.content}
                preview="preview"
                hideToolbar={true}
                visibleDragbar={false}
                data-color-mode="light"
                height={400}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
