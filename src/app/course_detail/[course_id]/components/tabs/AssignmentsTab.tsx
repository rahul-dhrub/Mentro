import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Assignment } from '../../types';
import DataTable, { Column } from '../DataTable';
import AssignmentModal from './assignmentsComponent/AssignmentModal';

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddAssignment = (assignmentData: Assignment) => {
    onAddAssignment(assignmentData);
  };

  const columns: Column<Assignment>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (assignment) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
          <div className="text-sm text-gray-500">{assignment.description}</div>
        </div>
      )
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (assignment) => (
        <span className="text-sm text-gray-500">{assignment.dueDate}</span>
      )
    },
    {
      key: 'submissions',
      header: 'Submissions',
      render: (assignment) => (
        <span className="text-sm text-gray-500">
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
            onClick={() => onEditAssignment(assignment.id)} 
            className="text-blue-600 hover:text-blue-900 cursor-pointer"
          >
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => onDeleteAssignment(assignment.id)} 
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
      
      <DataTable 
        columns={columns} 
        data={assignments} 
        keyExtractor={(assignment) => assignment.id} 
      />
    </div>
  );
} 