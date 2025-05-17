import React from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Quiz } from '../../types';
import DataTable, { Column } from '../DataTable';

interface QuizzesTabProps {
  quizzes: Quiz[];
  onAddQuiz: () => void;
  onEditQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
}

export default function QuizzesTab({
  quizzes,
  onAddQuiz,
  onEditQuiz,
  onDeleteQuiz
}: QuizzesTabProps) {
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
            className="text-blue-600 hover:text-blue-900"
          >
            <FiEdit2 size={18} />
          </button>
          <button 
            onClick={() => onDeleteQuiz(quiz.id)}
            className="text-red-600 hover:text-red-900"
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
          onClick={onAddQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus size={20} />
          <span>Add Quiz</span>
        </button>
      </div>
      <DataTable 
        columns={columns} 
        data={quizzes} 
        keyExtractor={(quiz) => quiz.id} 
      />
    </div>
  );
} 