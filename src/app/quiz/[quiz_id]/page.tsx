'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiEye, FiEdit2, FiClock, FiCalendar, FiArrowLeft, FiUser, FiBookOpen, FiPlay, FiPause, FiCheck, FiX, FiPlusCircle, FiTrash2, FiPlus, FiLoader, FiVideo, FiImage, FiFile, FiLink, FiExternalLink } from 'react-icons/fi';
import { quizAPI } from '@/lib/api';
import dynamic from 'next/dynamic';
import MediaPreviewModal from './components/MediaPreviewModal';
import ContentForm from '../../course_detail/[course_id]/components/tabs/chaptersComponent/ContentForm';
import { LessonContent } from '../../course_detail/[course_id]/components/tabs/chaptersComponent/types';

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface BaseQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'multiselect' | 'tita' | 'descriptive';
  marks: number;
  order: number;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: Option[];
}

interface MultiselectQuestion extends BaseQuestion {
  type: 'multiselect';
  options: Option[];
}

interface TitaQuestion extends BaseQuestion {
  type: 'tita';
  correctAnswer: string;
  caseSensitive: boolean;
}

interface DescriptiveQuestion extends BaseQuestion {
  type: 'descriptive';
  sampleAnswer?: string;
}

type Question = MultipleChoiceQuestion | MultiselectQuestion | TitaQuestion | DescriptiveQuestion;

interface QuizContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'pdf' | 'link';
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  duration: number;
  totalMarks: number;
  isPublished: boolean;
  scheduled?: boolean;
  startDateTime?: string;
  endDateTime?: string;
  questions: Question[];
  courseId?: string;
  courseName?: string;
  attempts?: number;
  contents?: QuizContent[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function QuizDetail() {
  const params = useParams();
  const router = useRouter();
  const quizId = params?.quiz_id as string;
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Media preview states
  const [selectedContent, setSelectedContent] = useState<QuizContent | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  
  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editScheduled, setEditScheduled] = useState(false);
  const [editStartDateTime, setEditStartDateTime] = useState('');
  const [editEndDateTime, setEditEndDateTime] = useState('');
  const [editContents, setEditContents] = useState<LessonContent[]>([]);
  
  // Question editing states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState<'multiple_choice' | 'multiselect' | 'tita' | 'descriptive'>('multiple_choice');
  
  // Question form states
  const [questionText, setQuestionText] = useState('');
  const [questionMarks, setQuestionMarks] = useState('');
  const [questionOptions, setQuestionOptions] = useState<Option[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [sampleAnswer, setSampleAnswer] = useState('');
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Fetch quiz data from database
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const result = await quizAPI.getById(quizId);
        
        if (result.success && result.data) {
          const quizData = result.data;
          
          // Transform database data to match our interface
          const transformedQuiz: Quiz = {
            id: quizData._id,
            title: quizData.title,
            description: quizData.description || '',
            totalQuestions: quizData.totalQuestions || 0,
            duration: quizData.duration,
            totalMarks: quizData.totalMarks || 0,
            isPublished: quizData.isPublished || false,
            scheduled: quizData.scheduled || false,
            startDateTime: quizData.startDateTime ? new Date(quizData.startDateTime).toISOString().slice(0, 16) : '',
            endDateTime: quizData.endDateTime ? new Date(quizData.endDateTime).toISOString().slice(0, 16) : '',
            questions: quizData.questions || [],
            courseId: quizData.courseId,
            contents: quizData.contents || [],
            createdBy: quizData.createdBy,
            createdAt: quizData.createdAt,
            updatedAt: quizData.updatedAt,
          };
          
          setQuiz(transformedQuiz);
        } else {
          setError(result.error || 'Failed to fetch quiz');
        }
      } catch (err) {
        setError('Failed to fetch quiz');
        console.error('Error fetching quiz:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionMarks('');
    setQuestionOptions([
      { id: 'opt1', text: '', isCorrect: false },
      { id: 'opt2', text: '', isCorrect: false }
    ]);
    setCorrectAnswer('');
    setCaseSensitive(false);
    setSampleAnswer('');
  };

  const initializeQuestionForm = (question: Question) => {
    setQuestionText(question.text);
    setQuestionMarks(question.marks.toString());
    
    if (question.type === 'multiple_choice' || question.type === 'multiselect') {
      setQuestionOptions(question.options);
    } else if (question.type === 'tita') {
      setCorrectAnswer(question.correctAnswer);
      setCaseSensitive(question.caseSensitive);
    } else if (question.type === 'descriptive') {
      setSampleAnswer(question.sampleAnswer || '');
    }
  };

  const handleAddOption = () => {
    const newOption: Option = {
      id: `opt${questionOptions.length + 1}`,
      text: '',
      isCorrect: false
    };
    setQuestionOptions([...questionOptions, newOption]);
  };

  const handleRemoveOption = (optionId: string) => {
    if (questionOptions.length > 2) {
      setQuestionOptions(questionOptions.filter(opt => opt.id !== optionId));
    }
  };

  const handleOptionChange = (optionId: string, text: string) => {
    setQuestionOptions(questionOptions.map(opt => 
      opt.id === optionId ? { ...opt, text } : opt
    ));
  };

  const handleOptionCorrectChange = (optionId: string, isCorrect: boolean) => {
    if (newQuestionType === 'multiple_choice') {
      // For multiple choice, only one option can be correct
      setQuestionOptions(questionOptions.map(opt => ({
        ...opt,
        isCorrect: opt.id === optionId ? isCorrect : false
      })));
    } else {
      // For multiselect, multiple options can be correct
      setQuestionOptions(questionOptions.map(opt => 
        opt.id === optionId ? { ...opt, isCorrect } : opt
      ));
    }
  };

  const handleSaveQuestion = () => {
    if (!quiz || !questionText.trim() || !questionMarks) return;

    const baseQuestion = {
      id: editingQuestionId || `q${Date.now()}`,
      text: questionText.trim(),
      marks: parseInt(questionMarks),
      order: editingQuestionId ? 
        quiz.questions.find(q => q.id === editingQuestionId)?.order || 0 : 
        quiz.questions.length
    };

    let newQuestion: Question;

    switch (newQuestionType) {
      case 'multiple_choice':
      case 'multiselect':
        if (questionOptions.some(opt => !opt.text.trim()) || 
            !questionOptions.some(opt => opt.isCorrect)) {
          alert('Please fill all options and select at least one correct answer');
          return;
        }
        newQuestion = {
          ...baseQuestion,
          type: newQuestionType,
          options: questionOptions.filter(opt => opt.text.trim())
        } as MultipleChoiceQuestion | MultiselectQuestion;
        break;
      case 'tita':
        if (!correctAnswer.trim()) {
          alert('Please provide the correct answer');
          return;
        }
        newQuestion = {
          ...baseQuestion,
          type: 'tita',
          correctAnswer: correctAnswer.trim(),
          caseSensitive
        } as TitaQuestion;
        break;
      case 'descriptive':
        newQuestion = {
          ...baseQuestion,
          type: 'descriptive',
          sampleAnswer: sampleAnswer.trim() || undefined
        } as DescriptiveQuestion;
        break;
    }

    setQuiz(prev => {
      if (!prev) return prev;
      
      let updatedQuestions;
      if (editingQuestionId) {
        // Update existing question
        updatedQuestions = prev.questions.map(q => 
          q.id === editingQuestionId ? newQuestion : q
        );
      } else {
        // Add new question
        updatedQuestions = [...prev.questions, newQuestion];
      }
      
      return {
        ...prev,
        questions: updatedQuestions,
        totalQuestions: updatedQuestions.length,
        totalMarks: updatedQuestions.reduce((sum, q) => sum + q.marks, 0)
      };
    });

    // Reset form
    resetQuestionForm();
    setIsAddingQuestion(false);
    setEditingQuestionId(null);
  };

  const handleEditQuestion = (question: Question) => {
    setNewQuestionType(question.type);
    initializeQuestionForm(question);
    setEditingQuestionId(question.id);
    setIsAddingQuestion(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuiz(prev => {
        if (!prev) return prev;
        
        const updatedQuestions = prev.questions
          .filter(q => q.id !== questionId)
          .map((q, index) => ({ ...q, order: index }));
        
        return {
          ...prev,
          questions: updatedQuestions,
          totalQuestions: updatedQuestions.length,
          totalMarks: updatedQuestions.reduce((sum, q) => sum + q.marks, 0)
        };
      });
    }
  };

  const handleStartAddQuestion = () => {
    resetQuestionForm();
    setNewQuestionType('multiple_choice');
    setIsAddingQuestion(true);
    setEditingQuestionId(null);
  };

  const handleCancelQuestionEdit = () => {
    resetQuestionForm();
    setIsAddingQuestion(false);
    setEditingQuestionId(null);
  };

  const handleSave = async () => {
    if (!quiz || !editTitle.trim() || !editDuration) return;

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        duration: parseInt(editDuration),
        scheduled: editScheduled,
        startDateTime: editScheduled ? editStartDateTime : undefined,
        endDateTime: editScheduled ? editEndDateTime : undefined,
        questions: quiz.questions,
        contents: editContents
      };

      const result = await quizAPI.update(quiz.id, updateData);

      if (result.success && result.data) {
        // Update local state with returned data
        const updatedQuiz = result.data;
        setQuiz(prev => prev ? {
          ...prev,
          title: updatedQuiz.title,
          description: updatedQuiz.description,
          duration: updatedQuiz.duration,
          scheduled: updatedQuiz.scheduled,
          startDateTime: updatedQuiz.startDateTime ? new Date(updatedQuiz.startDateTime).toISOString().slice(0, 16) : '',
          endDateTime: updatedQuiz.endDateTime ? new Date(updatedQuiz.endDateTime).toISOString().slice(0, 16) : '',
          totalQuestions: updatedQuiz.totalQuestions,
          totalMarks: updatedQuiz.totalMarks,
          contents: updatedQuiz.contents || [],
          updatedAt: updatedQuiz.updatedAt
        } : null);
        
        setIsEditing(false);
      } else {
        setError(result.error || 'Failed to save quiz');
      }
    } catch (err) {
      setError('Failed to save quiz');
      console.error('Error saving quiz:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = () => {
    if (!quiz) return;
    
    setEditTitle(quiz.title);
    setEditDescription(quiz.description);
    setEditDuration(quiz.duration.toString());
    setEditScheduled(quiz.scheduled || false);
    setEditStartDateTime(quiz.startDateTime || '');
    setEditEndDateTime(quiz.endDateTime || '');
    
    // Transform quiz contents to LessonContent format for editing
    const transformedContents: LessonContent[] = (quiz.contents || []).map(content => ({
      id: content.id,
      title: content.title,
      url: content.url,
      type: content.type as 'video' | 'image' | 'pdf' | 'link',
      order: content.order
    }));
    setEditContents(transformedContents);
    
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAddingQuestion(false);
    setEditingQuestionId(null);
    resetQuestionForm();
    setError(null);
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleContentClick = (content: QuizContent) => {
    setSelectedContent(content);
    setShowMediaModal(true);
  };

  // Content management handlers for editing
  const handleAddContent = (content: Omit<LessonContent, 'id' | 'order'>) => {
    const newContent: LessonContent = {
      id: Date.now().toString(),
      ...content,
      order: editContents.length,
    };
    setEditContents(prev => [...prev, newContent]);
  };

  const handleEditContent = (index: number, content: Omit<LessonContent, 'id' | 'order'>) => {
    setEditContents(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...content,
      };
      return updated;
    });
  };

  const handleDeleteContent = (index: number) => {
    setEditContents(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      // Update order of remaining contents
      return updated.map((content, idx) => ({ ...content, order: idx }));
    });
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'Multiple Choice';
      case 'multiselect': return 'Multiselect';
      case 'tita': return 'Type in Answer';
      case 'descriptive': return 'Descriptive';
      default: return 'Unknown';
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'multiple_choice': return 'bg-blue-100 text-blue-800';
      case 'multiselect': return 'bg-purple-100 text-purple-800';
      case 'tita': return 'bg-green-100 text-green-800';
      case 'descriptive': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Initialize question options when changing type
  useEffect(() => {
    if (isAddingQuestion && !editingQuestionId) {
      if (newQuestionType === 'multiple_choice' || newQuestionType === 'multiselect') {
        setQuestionOptions([
          { id: 'opt1', text: '', isCorrect: false },
          { id: 'opt2', text: '', isCorrect: false }
        ]);
      }
    }
  }, [newQuestionType, isAddingQuestion, editingQuestionId]);

  const renderContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FiVideo className="w-5 h-5 text-red-500" />;
      case 'image':
        return <FiImage className="w-5 h-5 text-green-500" />;
      case 'pdf':
        return <FiFile className="w-5 h-5 text-blue-500" />;
      case 'link':
        return <FiLink className="w-5 h-5 text-purple-500" />;
      default:
        return <FiFile className="w-5 h-5 text-gray-500" />;
    }
  };

  const renderQuizResources = () => {
    if (!quiz?.contents || quiz.contents.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Additional Resources</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quiz.contents.map((content, index) => (
              <div
                key={content.id}
                className="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {renderContentIcon(content.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h6 className="text-sm font-medium text-gray-900 truncate">
                    {content.title}
                  </h6>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {content.type}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {['video', 'image', 'pdf'].includes(content.type) && (
                    <button
                      onClick={() => handleContentClick(content)}
                      className="text-purple-600 hover:text-purple-700 flex items-center space-x-1 bg-purple-50 px-2 py-1 rounded text-xs"
                      title={`Preview ${content.title}`}
                    >
                      <FiEye className="w-3 h-3" />
                      <span>Preview</span>
                    </button>
                  )}
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium group-hover:text-blue-700 transition-colors"
                    title={`Open ${content.title}`}
                  >
                    <FiExternalLink className="w-4 h-4" />
                    <span>Open</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="flex items-center space-x-3">
              <FiLoader className="animate-spin" size={24} />
              <span className="text-gray-600 text-lg">Loading quiz...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-700 mb-4">
              <h2 className="text-lg font-semibold mb-2">Error Loading Quiz</h2>
              <p>{error}</p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
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

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FiBookOpen className="mr-2" size={16} />
                <span>Quiz</span>
                {quiz.createdAt && (
                  <span className="ml-4">
                    Created: {new Date(quiz.createdAt).toLocaleDateString()}
                  </span>
                )}
                {quiz.updatedAt && (
                  <span className="ml-4">
                    Updated: {new Date(quiz.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4 pr-6">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Quiz Title *
                    </label>
                    <input
                      id="edit-title"
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter quiz title"
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
                      placeholder="Enter quiz description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (minutes) *
                      </label>
                      <input
                        id="edit-duration"
                        type="number"
                        min="1"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="e.g. 30"
                      />
                    </div>
                    <div className="flex items-center mt-6">
                      <input
                        id="edit-scheduled"
                        type="checkbox"
                        checked={editScheduled}
                        onChange={(e) => setEditScheduled(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="edit-scheduled" className="ml-2 block text-sm text-gray-900">
                        Schedule quiz
                      </label>
                    </div>
                  </div>
                  {editScheduled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="edit-start" className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date & Time
                        </label>
                        <input
                          id="edit-start"
                          type="datetime-local"
                          value={editStartDateTime}
                          onChange={(e) => setEditStartDateTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit-end" className="block text-sm font-medium text-gray-700 mb-1">
                          End Date & Time
                        </label>
                        <input
                          id="edit-end"
                          type="datetime-local"
                          value={editEndDateTime}
                          onChange={(e) => setEditEndDateTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Resources Section */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Additional Resources</h4>
                      <p className="text-sm text-gray-600">Add videos, images, PDFs, or links as supplementary materials for this quiz.</p>
                    </div>
                    <ContentForm
                      lessonContents={editContents}
                      onAddContent={handleAddContent}
                      onEditContent={handleEditContent}
                      onDeleteContent={handleDeleteContent}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      quiz.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {quiz.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-lg">{quiz.description}</p>
                  {quiz.scheduled && quiz.startDateTime && quiz.endDateTime && (
                    <div className="mt-2 text-sm text-blue-600">
                      <FiCalendar className="inline mr-1" />
                      Scheduled: {new Date(quiz.startDateTime).toLocaleString()} - {new Date(quiz.endDateTime).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-6 ml-6">
              {!isEditing && (
                <div className="text-right">
                  <div className="flex items-center text-gray-500 mb-2">
                    <FiClock className="mr-2" />
                    <span className="font-medium">{quiz.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <span className="font-medium">{quiz.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <span className="font-medium">{quiz.totalMarks} marks</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiUser className="mr-2" />
                    <span>{quiz.attempts || 0} attempts</span>
                  </div>
                </div>
              )}
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FiEdit2 size={18} />
                  <span>Edit Quiz</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editTitle.trim() || !editDuration || saving}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      editTitle.trim() && editDuration && !saving
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {saving ? (
                      <>
                        <FiLoader className="animate-spin" size={18} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FiSave size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quiz Resources Section */}
        {renderQuizResources()}

        {/* Questions Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
              <div className="flex items-center space-x-4">
                {isEditing && !isAddingQuestion && (
                  <button
                    onClick={handleStartAddQuestion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <FiPlusCircle size={18} />
                    <span>Add Question</span>
                  </button>
                )}
                <button
                  onClick={() => setShowQuestions(!showQuestions)}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  {showQuestions ? <FiEye size={20} /> : <FiEye size={20} />}
                  <span className="ml-2">{showQuestions ? 'Hide' : 'Show'} Questions</span>
                </button>
              </div>
            </div>
          </div>
          
          {showQuestions && (
            <div className="p-6 space-y-6">
              {/* Add/Edit Question Form */}
              {isEditing && isAddingQuestion && (
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingQuestionId ? 'Edit Question' : 'Add New Question'}
                    </h3>
                    <button
                      onClick={handleCancelQuestionEdit}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  {/* Question Type Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                    <div className="flex flex-wrap gap-2">
                      {['multiple_choice', 'multiselect', 'tita', 'descriptive'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewQuestionType(type as any)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg ${
                            newQuestionType === type
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {getQuestionTypeLabel(type)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="mb-4">
                    <label htmlFor="question-text" className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text *
                    </label>
                    <textarea
                      id="question-text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter your question..."
                    />
                  </div>

                  {/* Question Marks */}
                  <div className="mb-4">
                    <label htmlFor="question-marks" className="block text-sm font-medium text-gray-700 mb-1">
                      Marks *
                    </label>
                    <input
                      id="question-marks"
                      type="number"
                      min="1"
                      value={questionMarks}
                      onChange={(e) => setQuestionMarks(e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g. 10"
                    />
                  </div>

                  {/* Options for Multiple Choice and Multiselect */}
                  {(newQuestionType === 'multiple_choice' || newQuestionType === 'multiselect') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options * (Select correct answer{newQuestionType === 'multiselect' ? 's' : ''})
                      </label>
                      <div className="space-y-2">
                        {questionOptions.map((option, index) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <input
                              type={newQuestionType === 'multiple_choice' ? 'radio' : 'checkbox'}
                              name="correct-option"
                              checked={option.isCorrect}
                              onChange={(e) => handleOptionCorrectChange(option.id, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(option.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                              placeholder={`Option ${index + 1}`}
                            />
                            {questionOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(option.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <FiPlus size={16} className="mr-1" />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Correct Answer for TITA */}
                  {newQuestionType === 'tita' && (
                    <div className="mb-4 space-y-3">
                      <div>
                        <label htmlFor="correct-answer" className="block text-sm font-medium text-gray-700 mb-1">
                          Correct Answer *
                        </label>
                        <input
                          id="correct-answer"
                          type="text"
                          value={correctAnswer}
                          onChange={(e) => setCorrectAnswer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          placeholder="Enter the correct answer"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          id="case-sensitive"
                          type="checkbox"
                          checked={caseSensitive}
                          onChange={(e) => setCaseSensitive(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="case-sensitive" className="ml-2 block text-sm text-gray-900">
                          Case sensitive
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Sample Answer for Descriptive */}
                  {newQuestionType === 'descriptive' && (
                    <div className="mb-4">
                      <label htmlFor="sample-answer" className="block text-sm font-medium text-gray-700 mb-1">
                        Sample Answer (Optional)
                      </label>
                      <textarea
                        id="sample-answer"
                        value={sampleAnswer}
                        onChange={(e) => setSampleAnswer(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        placeholder="Provide a sample answer for reference..."
                      />
                    </div>
                  )}

                  {/* Save/Cancel Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleCancelQuestionEdit}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <FiSave size={16} />
                      <span>{editingQuestionId ? 'Update' : 'Add'} Question</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Questions */}
              {quiz.questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded">
                        Q{index + 1}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getQuestionTypeColor(question.type)}`}>
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>
                    {isEditing && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-900 font-medium">{question.text}</p>
                  </div>
                  
                  {(question.type === 'multiple_choice' || question.type === 'multiselect') && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                      <ul className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <li key={option.id} className="flex items-center">
                            <span className={`w-6 h-6 mr-3 flex items-center justify-center rounded-full text-sm font-medium ${
                              option.isCorrect 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {option.isCorrect && <FiCheck size={14} />}
                              {!option.isCorrect && String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className={option.isCorrect ? 'font-medium text-green-700' : 'text-gray-700'}>
                              {option.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {question.type === 'tita' && (
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</p>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-mono text-sm">
                        {question.correctAnswer}
                      </span>
                      {question.caseSensitive && (
                        <span className="ml-2 text-xs text-gray-500">(Case sensitive)</span>
                      )}
                    </div>
                  )}
                  
                  {question.type === 'descriptive' && question.sampleAnswer && (
                    <div className="bg-white border border-gray-200 rounded p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Sample Answer:</p>
                      <p className="text-sm text-gray-600 italic">{question.sampleAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {quiz.questions.length === 0 && !isAddingQuestion && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No questions added yet.</p>
                  {isEditing && (
                    <button 
                      onClick={handleStartAddQuestion}
                      className="text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto"
                    >
                      <FiPlusCircle className="mr-2" />
                      Add Your First Question
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Media Preview Modal */}
      {showMediaModal && selectedContent && (
        <MediaPreviewModal
          isOpen={showMediaModal}
          content={selectedContent}
          onClose={() => setShowMediaModal(false)}
          renderContentIcon={renderContentIcon}
        />
      )}
    </div>
  );
} 