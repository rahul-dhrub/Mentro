'use client';

import { useState } from 'react';
import { FiBook, FiFileText, FiClock, FiVideo, FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiX, FiUser } from 'react-icons/fi';
import CourseHeader from './components/CourseHeader';
import TabNavigation from './components/TabNavigation';
import OverviewTab from './components/tabs/OverviewTab';
import ChaptersTab from './components/tabs/ChaptersTab';
import AssignmentsTab from './components/tabs/AssignmentsTab';
import QuizzesTab from './components/tabs/QuizzesTab';
import FacultyTab from './components/tabs/FacultyTab';
import StudentsTab from './components/tabs/StudentsTab';
import { Chapter, Assignment, Quiz, Faculty, Student } from './types';

export default function FacultyCourseDetail({ params }: { params: { course_id: string } }) {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Chapter state and handlers
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['1']));
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: '1',
      title: 'Introduction to Web Development',
      description: 'Learn the basics of web development and HTML',
      videoUrl: 'https://example.com/video1',
      duration: '45:00',
      isPublished: true,
      lessons: [
        {
          id: '1',
          title: 'Introduction to HTML',
          description: 'Learn the basics of HTML and its structure',
          duration: '30:00',
          isPublished: true,
          assignments: [],
          quizzes: []
        }
      ]
    },
  ]);
  
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

  const handleAddChapter = () => {
    console.log('Add chapter clicked');
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

  const handleDeleteChapter = (chapterId: string) => {
    console.log('Delete chapter:', chapterId);
  };

  const handleAddLesson = (chapterId: string) => {
    console.log('Add lesson to chapter:', chapterId);
  };

  const handleEditLesson = (chapterId: string, lessonId: string) => {
    console.log('Edit lesson:', lessonId, 'in chapter:', chapterId);
  };

  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    console.log('Delete lesson:', lessonId, 'from chapter:', chapterId);
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
