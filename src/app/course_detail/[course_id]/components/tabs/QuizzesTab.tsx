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
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Bulk delete states
  const [selectedQuizzes, setSelectedQuizzes] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

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
      console.log('QuizzesTab - Received quiz data:', quizData);
      console.log('QuizzesTab - Contents from modal:', quizData.contents);
      
      // Prepare data for database according to the schema
      const dbQuizData = {
        title: quizData.title,
        description: quizData.description || '',
        duration: parseInt(quizData.duration),
        isPublished: Boolean(quizData.isPublished),
        scheduled: Boolean(quizData.scheduled),
        startDateTime: quizData.scheduled ? quizData.startDateTime : undefined,
        endDateTime: quizData.scheduled ? quizData.endDateTime : undefined,
        questions: quizData.questions || [],
        contents: quizData.contents || [],
        courseId: courseId,
        lessonId: undefined, // Set this if you have lesson context
      };

      console.log('QuizzesTab - Sending to API:', dbQuizData);
      console.log('QuizzesTab - Contents to API:', dbQuizData.contents);

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

  const handleQuickDelete = (quizId: string) => {
    const quiz = quizzes.find(q => q.id === quizId);
    if (quiz && !quiz.isPublished) {
      // For unpublished quizzes, show a simpler confirmation
      if (window.confirm(`Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`)) {
        handleDirectDelete(quizId);
      }
    } else {
      // For published quizzes, use the full confirmation modal
      handleDeleteClick(quizId);
    }
  };

  const handleDirectDelete = async (quizId: string) => {
    try {
      setIsDeleting(true);
      const result = await quizAPI.delete(quizId);
      
      if (result.success) {
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
        setError(null);
        // You could add a success toast here
        console.log('Quiz deleted successfully');
      } else {
        setError(result.error || 'Failed to delete quiz');
      }
    } catch (err) {
      setError('Failed to delete quiz');
      console.error('Error deleting quiz:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (quizToDelete && deleteConfirmation === quizToDelete.title) {
      try {
        setIsDeleting(true);
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
      } finally {
        setIsDeleting(false);
        setShowDeleteModal(false);
        setQuizToDelete(null);
        setDeleteConfirmation('');
      }
    }
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  // Bulk delete functions
  const handleSelectQuiz = (quizId: string) => {
    const newSelected = new Set(selectedQuizzes);
    if (newSelected.has(quizId)) {
      newSelected.delete(quizId);
    } else {
      newSelected.add(quizId);
    }
    setSelectedQuizzes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedQuizzes.size === quizzes.length) {
      setSelectedQuizzes(new Set());
    } else {
      setSelectedQuizzes(new Set(quizzes.map(q => q.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuizzes.size === 0) return;
    
    try {
      setIsDeleting(true);
      const deletePromises = Array.from(selectedQuizzes).map(quizId => 
        quizAPI.delete(quizId)
      );
      
      const results = await Promise.all(deletePromises);
      const failedDeletes = results.filter(result => !result.success);
      
      if (failedDeletes.length === 0) {
        setQuizzes(prev => prev.filter(q => !selectedQuizzes.has(q.id)));
        setSelectedQuizzes(new Set());
        setError(null);
        console.log(`Successfully deleted ${selectedQuizzes.size} quizzes`);
      } else {
        setError(`Failed to delete ${failedDeletes.length} quizzes`);
      }
    } catch (err) {
      setError('Failed to delete selected quizzes');
      console.error('Error bulk deleting quizzes:', err);
    } finally {
      setIsDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
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
      key: 'select',
      header: '',
      render: (quiz) => (
        <input
          type="checkbox"
          checked={selectedQuizzes.has(quiz.id)}
          onChange={() => handleSelectQuiz(quiz.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      className: 'w-12'
    },
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
        <div className="flex justify-end items-center space-x-2">
          {/* Edit Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleQuizClick(quiz.id);
            }}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Edit Quiz"
          >
            <FiEdit2 size={16} />
          </button>
          
          {/* Delete Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleQuickDelete(quiz.id);
            }}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 cursor-pointer"
            title="Delete Quiz"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Quizzes</h2>
          {selectedQuizzes.size > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedQuizzes.size} selected
              </span>
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                disabled={isDeleting}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <FiTrash2 size={14} />
                <span>Delete Selected</span>
              </button>
              <button
                onClick={() => setSelectedQuizzes(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
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
      
      {/* Bulk Selection Controls */}
      {quizzes.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedQuizzes.size === quizzes.length && quizzes.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="text-sm text-gray-700">
              Select All ({quizzes.length} quizzes)
            </label>
          </div>
          {selectedQuizzes.size > 0 && (
            <div className="text-sm text-gray-600">
              {selectedQuizzes.size} of {quizzes.length} quizzes selected
            </div>
          )}
        </div>
      )}
      
      {/* Quiz Modal */}
      <QuizModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddQuiz={handleAddQuiz}
      />
      
      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Multiple Quizzes</h3>
              </div>
              <button 
                onClick={() => !isDeleting && setShowBulkDeleteConfirm(false)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:cursor-not-allowed"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiX className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: This action cannot be undone
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        You are about to permanently delete <strong>{selectedQuizzes.size}</strong> quiz{selectedQuizzes.size > 1 ? 'es' : ''} 
                        and all associated data including student attempts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="max-h-32 overflow-y-auto bg-gray-50 rounded p-2">
                <div className="text-sm text-gray-700">
                  <strong>Quizzes to be deleted:</strong>
                  <ul className="mt-1 space-y-1">
                    {Array.from(selectedQuizzes).map(quizId => {
                      const quiz = quizzes.find(q => q.id === quizId);
                      return quiz ? (
                        <li key={quizId} className="text-xs">• {quiz.title}</li>
                      ) : null;
                    })}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-red-700 flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      <span>Delete {selectedQuizzes.size} Quiz{selectedQuizzes.size > 1 ? 'es' : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal for single quiz */}
      {showDeleteModal && quizToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Quiz</h3>
              </div>
              <button 
                onClick={() => !isDeleting && setShowDeleteModal(false)}
                disabled={isDeleting}
                className="text-gray-400 hover:text-gray-600 cursor-pointer disabled:cursor-not-allowed"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiX className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: This action cannot be undone
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        This will permanently delete the quiz "<strong>{quizToDelete.title}</strong>" 
                        and all associated data including student attempts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="delete-confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                  To confirm, type <span className="font-semibold text-gray-900">"{quizToDelete.title}"</span> in the field below:
                </label>
                <input
                  id="delete-confirmation"
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={`Type "${quizToDelete.title}" to confirm`}
                  disabled={isDeleting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmation !== quizToDelete.title || isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 ${
                    deleteConfirmation === quizToDelete.title && !isDeleting
                      ? 'hover:bg-red-700' 
                      : ''
                  }`}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={16} />
                      <span>Delete Quiz</span>
                    </>
                  )}
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