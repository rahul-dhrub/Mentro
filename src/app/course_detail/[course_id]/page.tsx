'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiFileText, FiClock, FiVideo, FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiX, FiUser } from 'react-icons/fi';
import CourseHeader from './components/CourseHeader';
import TabNavigation from './components/TabNavigation';
import OverviewTab from './components/tabs/OverviewTab';
import ChaptersTab from './components/tabs/ChaptersTab';
import AssignmentsTab from './components/tabs/AssignmentsTab';
import QuizzesTab from './components/tabs/QuizzesTab';
import FacultyTab from './components/tabs/FacultyTab';
import StudentsTab from './components/tabs/StudentsTab';
import { Assignment, Quiz, Faculty, Student } from './types';
import useChaptersAndLessons from './hooks/useChaptersAndLessons';

export default function FacultyCourseDetail({ params }: { params: Promise<{ course_id: string }> }) {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [courseId, setCourseId] = useState<string | null>(null);
  
  // Initialize course ID from params
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.course_id);
    };
    initializeParams();
  }, [params]);
  
  // Use the database hook for chapters and lessons - only when courseId is available
  const {
    chapters,
    loading: chaptersLoading,
    error: chaptersError,
    addChapter,
    deleteChapter,
    addLesson,
    deleteLesson,
  } = useChaptersAndLessons(courseId || '');
  
  // Chapter UI state
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // Assignment state
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'HTML Basics Assignment',
      description: 'Create a simple webpage using HTML',
      dueDate: '2024-03-20',
      totalMarks: 100,
      submissions: 15,
    },
  ]);
  
  // Quiz state
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: '1',
      title: 'HTML Fundamentals Quiz',
      description: 'Test your knowledge of HTML basics',
      totalQuestions: 20,
      duration: 30,
      totalMarks: 100,
      isPublished: true,
    },
  ]);
  
  // Faculty state
  const [faculty, setFaculty] = useState<Faculty[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60',
      joinedAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'faculty',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=60',
      joinedAt: '2024-02-15'
    }
  ]);
  
  // Student state
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      progress: 75,
      lastActivity: '2 hours ago',
      status: 'active'
    }
  ]);

  // Event handlers
  const handleEditCourse = () => {
    console.log('Edit course clicked');
  };

  const handleAddChapter = async (chapterData: { title: string; description: string }) => {
    try {
      await addChapter(chapterData);
    } catch (error) {
      console.error('Failed to add chapter:', error);
    }
  };

  const handleToggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleEditChapter = (chapterId: string) => {
    console.log('Edit chapter:', chapterId);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapter(chapterId);
    } catch (error) {
      console.error('Failed to delete chapter:', error);
    }
  };

  const handleAddLesson = async (chapterId: string, lessonData: any) => {
    try {
      await addLesson(chapterId, lessonData);
    } catch (error) {
      console.error('Failed to add lesson:', error);
    }
  };

  const handleEditLesson = (chapterId: string, lessonId: string) => {
    console.log('Edit lesson:', lessonId, 'in chapter:', chapterId);
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    try {
      await deleteLesson(chapterId, lessonId);
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  const handleAddAssignment = () => {
    console.log('Add assignment clicked');
  };

  const handleEditAssignment = (assignmentId: string) => {
    console.log('Edit assignment:', assignmentId);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    console.log('Delete assignment:', assignmentId);
  };

  const handleAddQuiz = () => {
    console.log('Add quiz clicked');
  };

  const handleEditQuiz = (quizId: string) => {
    console.log('Edit quiz:', quizId);
  };

  const handleDeleteQuiz = (quizId: string) => {
    console.log('Delete quiz:', quizId);
  };

  const handleAddFaculty = () => {
    console.log('Add faculty clicked');
  };

  const handleRemoveFaculty = (facultyId: string) => {
    console.log('Remove faculty:', facultyId);
  };
  
  const handleExportStudentList = () => {
    console.log('Export student list clicked');
  };
  
  const handleViewStudentDetails = (studentId: string) => {
    console.log('View student details:', studentId);
  };

  // Show loading state while course ID is being resolved or chapters are loading
  if (!courseId || chaptersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (chaptersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading course: {chaptersError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render the active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            onAddChapter={handleAddChapter}
            onCreateAssignment={handleAddAssignment}
            onCreateQuiz={handleAddQuiz}
            onTabChange={setActiveTab}
          />
        );
      case 'chapters':
        return (
          <ChaptersTab
            chapters={chapters}
            expandedChapters={expandedChapters}
            onAddChapter={handleAddChapter}
            onToggleChapter={handleToggleChapter}
            onEditChapter={handleEditChapter}
            onDeleteChapter={handleDeleteChapter}
            onAddLesson={handleAddLesson}
            onEditLesson={handleEditLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        );
      case 'assignments':
        return (
          <AssignmentsTab
            assignments={assignments}
            onAddAssignment={handleAddAssignment}
            onEditAssignment={handleEditAssignment}
            onDeleteAssignment={handleDeleteAssignment}
          />
        );
      case 'quizzes':
        return (
          <QuizzesTab
            quizzes={quizzes}
            onAddQuiz={handleAddQuiz}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        );
      case 'faculty':
        return (
          <FacultyTab
            faculty={faculty}
            onAddFaculty={handleAddFaculty}
            onRemoveFaculty={handleRemoveFaculty}
          />
        );
      case 'students':
        return (
          <StudentsTab
            students={students}
            onExportList={handleExportStudentList}
            onViewStudentDetails={handleViewStudentDetails}
          />
        );
      default:
        return null;
    }
  };

  // Available tabs
  const availableTabs = ['overview', 'chapters', 'assignments', 'quizzes', 'faculty', 'students'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <CourseHeader
        title="Web Development Bootcamp"
        description="Learn web development from scratch"
        thumbnail="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
        onEditCourse={handleEditCourse}
      />

      {/* Navigation Tabs */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={availableTabs}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveTab()}
      </div>
    </div>
  );
}
