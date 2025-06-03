import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Assignment } from '../../types';
import DataTable, { Column } from '../DataTable';
import AssignmentModal from './assignmentsComponent/AssignmentModal';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { assignmentAPI } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface DatabaseAssignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  courseId?: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AssignmentsTabProps {
  courseId: string;
}

export default function AssignmentsTab({ courseId }: AssignmentsTabProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Fetch assignments from database
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await assignmentAPI.getAll(courseId);
        
        if (result.success && result.data) {
          // Transform database assignments to match our interface
          const transformedAssignments: Assignment[] = (result.data as DatabaseAssignment[]).map(assignment => ({
            id: assignment._id,
            title: assignment.title,
            description: assignment.description,
            dueDate: new Date(assignment.dueDate).toLocaleDateString(),
            totalMarks: assignment.totalMarks,
            submissions: assignment.submissions
          }));
          
          setAssignments(transformedAssignments);
        } else {
          setError(result.error || 'Failed to fetch assignments');
        }
      } catch (err) {
        setError('Failed to fetch assignments');
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseId]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddAssignment = async (assignmentData: any) => {
    try {
      // Convert contents array to proper attachment objects
      const attachments = assignmentData.contents ? assignmentData.contents.map((content: any) => ({
        id: content.id || Date.now().toString(),
        name: content.title,
        type: content.type,
        size: 0, // We don't have size info from the content form, set to 0
        url: content.url
      })) : [];
      
      // Prepare data for database
      const dbAssignmentData = {
        title: assignmentData.title,
        description: assignmentData.description,
        content: assignmentData.content || '', // Use the content from the form
        dueDate: assignmentData.dueDate,
        totalMarks: assignmentData.totalMarks,
        courseId: courseId,
        attachments: attachments // Store multimedia content as attachments
      };

      const result = await assignmentAPI.create(dbAssignmentData);
      
      if (result.success && result.data) {
        // Transform and add to local state
        const newAssignment: Assignment = {
          id: (result.data as DatabaseAssignment)._id,
          title: (result.data as DatabaseAssignment).title,
          description: (result.data as DatabaseAssignment).description,
          dueDate: new Date((result.data as DatabaseAssignment).dueDate).toLocaleDateString(),
          totalMarks: (result.data as DatabaseAssignment).totalMarks,
          submissions: (result.data as DatabaseAssignment).submissions
        };
        
        setAssignments(prev => [...prev, newAssignment]);
        setError(null);
      } else {
        setError(result.error || 'Failed to create assignment');
      }
    } catch (err) {
      setError('Failed to create assignment');
      console.error('Error creating assignment:', err);
    }
  };
  
  const handleDeleteClick = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setAssignmentToDelete({ id: assignment.id, title: assignment.title });
      setDeleteConfirmation('');
      setShowDeleteModal(true);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (assignmentToDelete && deleteConfirmation === assignmentToDelete.title) {
      try {
        const result = await assignmentAPI.delete(assignmentToDelete.id);
        
        if (result.success) {
          setAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id));
          setError(null);
        } else {
          setError(result.error || 'Failed to delete assignment');
        }
      } catch (err) {
        setError('Failed to delete assignment');
        console.error('Error deleting assignment:', err);
      }
      
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
      setDeleteConfirmation('');
    }
  };

  const handleAssignmentClick = (assignmentId: string) => {
    router.push(`/assignment/${assignmentId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <FiPlus size={20} />
            <span>Add Assignment</span>
          </button>
        </div>
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading assignments...</div>
        </div>
      </div>
    );
  }

  const columns: Column<Assignment>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (assignment) => (
        <div 
          onClick={() => handleAssignmentClick(assignment.id)}
          className="cursor-pointer hover:bg-gray-50 p-2 rounded"
        >
          <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
          <div className="text-sm text-gray-500 prose prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                p: ({children}) => <p className="text-sm text-gray-500 mb-1">{children}</p>,
                strong: ({children}) => <strong className="font-medium text-gray-600">{children}</strong>,
                em: ({children}) => <em className="italic text-gray-500">{children}</em>,
                code: ({children}) => (
                  <code className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                a: ({href, children}) => (
                  <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                ul: ({children}) => <ul className="list-disc list-inside text-sm text-gray-500">{children}</ul>,
                ol: ({children}) => <ol className="list-decimal list-inside text-sm text-gray-500">{children}</ol>,
                li: ({children}) => <li className="text-sm text-gray-500">{children}</li>,
                h1: ({children}) => <h1 className="text-sm font-semibold text-gray-600 mb-1">{children}</h1>,
                h2: ({children}) => <h2 className="text-sm font-semibold text-gray-600 mb-1">{children}</h2>,
                h3: ({children}) => <h3 className="text-xs font-semibold text-gray-600 mb-1">{children}</h3>,
                blockquote: ({children}) => (
                  <blockquote className="border-l-2 border-gray-300 pl-2 italic text-gray-400 text-xs">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {assignment.description}
            </ReactMarkdown>
          </div>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (assignment) => (
        <span 
          onClick={() => handleAssignmentClick(assignment.id)}
          className="text-sm text-gray-500 cursor-pointer hover:bg-gray-50 p-2 rounded block"
        >
          {assignment.dueDate}
        </span>
      )
    },
    {
      key: 'submissions',
      header: 'Submissions',
      render: (assignment) => (
        <span 
          onClick={() => handleAssignmentClick(assignment.id)}
          className="text-sm text-gray-500 cursor-pointer hover:bg-gray-50 p-2 rounded block"
        >
          {assignment.submissions} / {assignment.totalMarks}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (assignment) => (
        <div className="flex justify-end space-x-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(assignment.id);
            }} 
            className="text-red-600 hover:text-red-900 cursor-pointer"
          >
            <FiTrash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <FiPlus size={20} />
          <span>Add Assignment</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}
      
      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddAssignment={handleAddAssignment}
        courseId={courseId}
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && assignmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-600">Delete Assignment</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete the assignment
                  and all student submissions.
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                To confirm, type <strong className="font-medium">{assignmentToDelete.title}</strong> in the field below:
              </p>
              
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                autoFocus
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmation !== assignmentToDelete.title}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
                    deleteConfirmation === assignmentToDelete.title 
                      ? 'hover:bg-red-700 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Delete Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DataTable 
        columns={columns} 
        data={assignments} 
        keyExtractor={(assignment) => assignment.id} 
      />
    </div>
  );
} 