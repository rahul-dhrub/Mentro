import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Assignment } from '../../types';
import DataTable, { Column } from '../DataTable';
import AssignmentModal from './assignmentsComponent/AssignmentModal';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface AssignmentsTabProps {
  assignments: Assignment[];
  onAddAssignment: (assignment: Assignment) => void;
  onEditAssignment: (assignmentId: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

export default function AssignmentsTab({
  assignments,
  onAddAssignment,
  onEditAssignment,
  onDeleteAssignment
}: AssignmentsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddAssignment = (assignmentData: Assignment) => {
    onAddAssignment(assignmentData);
  };
  
  const handleDeleteClick = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setAssignmentToDelete({ id: assignment.id, title: assignment.title });
      setDeleteConfirmation('');
      setShowDeleteModal(true);
    }
  };
  
  const handleConfirmDelete = () => {
    if (assignmentToDelete && deleteConfirmation === assignmentToDelete.title) {
      onDeleteAssignment(assignmentToDelete.id);
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
      setDeleteConfirmation('');
    }
  };

  const handleAssignmentClick = (assignmentId: string) => {
    router.push(`/assignment/${assignmentId}`);
  };

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
          <div className="text-sm text-gray-500">{assignment.description}</div>
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
      
      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddAssignment={handleAddAssignment}
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