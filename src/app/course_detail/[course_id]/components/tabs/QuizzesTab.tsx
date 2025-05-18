import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Quiz } from '../../types';
import DataTable, { Column } from '../DataTable';
import QuizModal from './quizzesComponent/QuizModal';

interface QuizzesTabProps {
  quizzes: Quiz[];
  onAddQuiz: (quiz: Quiz) => void;
  onEditQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
}

export default function QuizzesTab({
  quizzes,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz
}: QuizzesTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddQuiz = (quizData: any) => {
    onAddQuiz({
      id: Date.now().toString(),
      ...quizData
    });
  };
  
  const handleDeleteClick = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setQuizToDelete({ id: quiz.id, title: quiz.title });
      setDeleteConfirmation('');
      setShowDeleteModal(true);
    }
  };
  
  const handleConfirmDelete = () => {
    if (quizToDelete && deleteConfirmation === quizToDelete.title) {
      onDeleteQuiz(quizToDelete.id);
      setShowDeleteModal(false);
      setQuizToDelete(null);
      setDeleteConfirmation('');
    }
  };

  const columns: Column<Quiz>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (quiz) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
          <div className="text-sm text-gray-500">{quiz.description}</div>
        </div>
      )
    },
    {
      key: 'questions',
      header: 'Questions',
      render: (quiz) => (
        <span className="text-sm text-gray-500">{quiz.totalQuestions}</span>
      )
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (quiz) => (
        <span className="text-sm text-gray-500">{quiz.duration} mins</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (quiz) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            quiz.isPublished
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {quiz.isPublished ? 'Published' : 'Draft'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (quiz) => (
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => onEditQuiz(quiz.id)} 
            className="text-blue-600 hover:text-blue-900 cursor-pointer"
          >
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => handleDeleteClick(quiz.id)}
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
        <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <FiPlus size={20} />
          <span>Add Quiz</span>
        </button>
      </div>
      
      {/* Quiz Modal */}
      <QuizModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddQuiz={handleAddQuiz}
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && quizToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-600">Delete Quiz</h3>
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
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete the quiz
                  and all student attempts.
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                To confirm, type <strong className="font-medium">{quizToDelete.title}</strong> in the field below:
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
                  disabled={deleteConfirmation !== quizToDelete.title}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
                    deleteConfirmation === quizToDelete.title 
                      ? 'hover:bg-red-700 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Delete Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DataTable 
        columns={columns} 
        data={quizzes} 
        keyExtractor={(quiz) => quiz.id} 
      />
    </div>
  );
} 