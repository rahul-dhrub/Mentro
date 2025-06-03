import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { Quiz } from '../../types';
import DataTable, { Column } from '../DataTable';
import QuizModal from './quizzesComponent/QuizModal';
import { useRouter } from 'next/navigation';
import { quizAPI } from '@/lib/api';

interface DatabaseQuiz {
  _id: string;
  title: string;
  description: string;
  questions: any[];
  totalQuestions: number;
  duration: number;
  totalMarks: number;
  isPublished: boolean;
  courseId?: {
    _id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface QuizzesTabProps {
  courseId: string;
}

export default function QuizzesTab({ courseId }: QuizzesTabProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Fetch quizzes from database
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await quizAPI.getAll(courseId);
        
        if (result.success && result.data) {
          // Transform database quizzes to match our interface
          const transformedQuizzes: Quiz[] = (result.data as DatabaseQuiz[]).map(quiz => ({
            id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            totalQuestions: quiz.totalQuestions,
            duration: quiz.duration,
            totalMarks: quiz.totalMarks,
            isPublished: quiz.isPublished
          }));
          
          setQuizzes(transformedQuizzes);
        } else {
          setError(result.error || 'Failed to fetch quizzes');
        }
      } catch (err) {
        setError('Failed to fetch quizzes');
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddQuiz = async (quizData: any) => {
    try {
      // Prepare data for database
      const dbQuizData = {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions || [],
        duration: quizData.duration,
        totalMarks: quizData.totalMarks || 0,
        isPublished: quizData.isPublished || false,
        courseId: courseId,
        startDate: quizData.startDate,
        endDate: quizData.endDate,
        attemptsAllowed: quizData.attemptsAllowed || 1,
        showResults: quizData.showResults || 'after_submission',
        passingScore: quizData.passingScore || 0,
        shuffleQuestions: quizData.shuffleQuestions || false,
        shuffleOptions: quizData.shuffleOptions || false
      };

      const result = await quizAPI.create(dbQuizData);
      
      if (result.success && result.data) {
        // Transform and add to local state
        const newQuiz: Quiz = {
          id: (result.data as DatabaseQuiz)._id,
          title: (result.data as DatabaseQuiz).title,
          description: (result.data as DatabaseQuiz).description,
          totalQuestions: (result.data as DatabaseQuiz).totalQuestions,
          duration: (result.data as DatabaseQuiz).duration,
          totalMarks: (result.data as DatabaseQuiz).totalMarks,
          isPublished: (result.data as DatabaseQuiz).isPublished
        };
        
        setQuizzes(prev => [...prev, newQuiz]);
        setError(null);
      } else {
        setError(result.error || 'Failed to create quiz');
      }
    } catch (err) {
      setError('Failed to create quiz');
      console.error('Error creating quiz:', err);
    }
  };
  
  const handleDeleteClick = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz) {
      setQuizToDelete({ id: quiz.id, title: quiz.title });
      setDeleteConfirmation('');
      setShowDeleteModal(true);
    }
  };
  
  const handleConfirmDelete = async () => {
    if (quizToDelete && deleteConfirmation === quizToDelete.title) {
      try {
        const result = await quizAPI.delete(quizToDelete.id);
        
        if (result.success) {
          setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
          setError(null);
        } else {
          setError(result.error || 'Failed to delete quiz');
        }
      } catch (err) {
        setError('Failed to delete quiz');
        console.error('Error deleting quiz:', err);
      }
      
      setShowDeleteModal(false);
      setQuizToDelete(null);
      setDeleteConfirmation('');
    }
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  if (loading) {
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">{error}</div>
          </div>
        )}
        
        {/* Quiz Modal */}
        <QuizModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddQuiz={handleAddQuiz}
        />
        
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">Loading quizzes...</div>
        </div>
      </div>
    );
  }

  const columns: Column<Quiz>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (quiz) => (
        <div 
          onClick={() => handleQuizClick(quiz.id)}
          className="cursor-pointer hover:bg-gray-50 p-2 rounded"
        >
          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
          <div className="text-sm text-gray-500">{quiz.description}</div>
        </div>
      )
    },
    {
      key: 'questions',
      header: 'Questions',
      render: (quiz) => (
        <span 
          onClick={() => handleQuizClick(quiz.id)}
          className="text-sm text-gray-500 cursor-pointer hover:bg-gray-50 p-2 rounded block"
        >
          {quiz.totalQuestions}
        </span>
      )
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (quiz) => (
        <span 
          onClick={() => handleQuizClick(quiz.id)}
          className="text-sm text-gray-500 cursor-pointer hover:bg-gray-50 p-2 rounded block"
        >
          {quiz.duration} mins
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (quiz) => (
        <span
          onClick={() => handleQuizClick(quiz.id)}
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer hover:bg-gray-50 ${
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
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(quiz.id);
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
        <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <FiPlus size={20} />
          <span>Add Quiz</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}
      
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