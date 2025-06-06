'use client';

import { useState, useEffect } from 'react';
import { FiBook, FiFileText, FiClock, FiVideo, FiEdit2, FiTrash2, FiPlus, FiChevronDown, FiX, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
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
import useCourseData from './hooks/useCourseData';
import useCourseStats from './hooks/useCourseStats';
import { facultyAPI } from '@/lib/api/faculty';

export default function FacultyCourseDetail({ params }: { params: Promise<{ course_id: string }> }) {
  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [courseId, setCourseId] = useState<string | null>(null);
  const router = useRouter();
  
  // Initialize course ID from params
  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.course_id);
    };
    initializeParams();
  }, [params]);
  
  // Fetch course data
  const {
    course,
    loading: courseLoading,
    error: courseError,
    refetch: refetchCourse
  } = useCourseData(courseId || '');
  
  // Fetch course statistics
  const {
    stats,
    loading: statsLoading,
    error: statsError
  } = useCourseStats(courseId || '');
  
  // Use the database hook for chapters and lessons - only when courseId is available
  const {
    chapters,
    loading: chaptersLoading,
    error: chaptersError,
    addChapter,
    deleteChapter,
    addLesson,
    deleteLesson,
    editChapter,
    editLesson,
  } = useChaptersAndLessons(courseId || '');
  
  // Chapter UI state
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // Faculty state
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [facultyError, setFacultyError] = useState<string | null>(null);
  
  // Fetch faculty data when courseId is available
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!courseId) return;
      
      try {
        setFacultyLoading(true);
        setFacultyError(null);
        
        const result = await facultyAPI.getFaculty(courseId);
        
        if (result.success && result.data) {
          setFaculty(result.data);
        } else {
          setFacultyError(result.error || 'Failed to fetch faculty');
          // Start with empty faculty list if fetch fails
          setFaculty([]);
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        setFacultyError('Failed to fetch faculty');
        setFaculty([]);
      } finally {
        setFacultyLoading(false);
      }
    };
    
    fetchFaculty();
  }, [courseId]);
  
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

  const handleEditChapter = async (chapterId: string, chapterData: { title: string; description: string; isPublished: boolean }) => {
    try {
      await editChapter(chapterId, chapterData);
    } catch (error) {
      console.error('Failed to edit chapter:', error);
    }
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

  const handleEditLesson = async (chapterId: string, lessonId: string, lessonData: any) => {
    try {
      await editLesson(chapterId, lessonId, lessonData);
    } catch (error) {
      console.error('Failed to edit lesson:', error);
    }
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    try {
      await deleteLesson(chapterId, lessonId);
    } catch (error) {
      console.error('Failed to delete lesson:', error);
    }
  };

  // const handleAddQuiz = () => {
  //   console.log('Add quiz clicked');
  // };

  // const handleEditQuiz = (quizId: string) => {
  //   console.log('Edit quiz:', quizId);
  // };

  // const handleDeleteQuiz = (quizId: string) => {
  //   console.log('Delete quiz:', quizId);
  // };

  const handleAddFaculty = (facultyData: { name: string; email: string; role: 'owner' | 'faculty' }) => {
    // This handler is now managed by the FacultyTab component itself
    // Just log for now since the API calls are handled in the component
    console.log('Add faculty clicked:', facultyData);
  };

  const handleRemoveFaculty = (facultyId: string) => {
    // This handler is now managed by the FacultyTab component itself
    console.log('Remove faculty:', facultyId);
  };

  const handleTransferOwnership = (newOwnerEmail: string) => {
    // This handler is now managed by the FacultyTab component itself
    console.log('Transfer ownership:', newOwnerEmail);
  };

  const handleFacultyUpdate = (updatedFaculty: Faculty[]) => {
    // Update the local faculty state when changes are made
    setFaculty(updatedFaculty);
  };
  
  const handleExportStudentList = () => {
    console.log('Export student list clicked');
  };
  
  const handleViewStudentDetails = (studentId: string) => {
    console.log('View student details:', studentId);
  };

  // Show loading state while course ID is being resolved or data is loading
  if (!courseId || courseLoading || chaptersLoading || (activeTab === 'faculty' && facultyLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!courseId ? 'Loading course...' : 
             courseLoading ? 'Loading course data...' :
             chaptersLoading ? 'Loading chapters...' : 
             'Loading faculty...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (courseError || chaptersError || (activeTab === 'faculty' && facultyError)) {
    const errorMessage = courseError || chaptersError || facultyError;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading {courseError ? 'course data' : chaptersError ? 'chapters' : 'faculty'}: {errorMessage}
          </p>
          <button
            onClick={() => {
              if (courseError) refetchCourse();
              else window.location.reload();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show error if course not found
  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Course not found</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
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
            stats={stats}
            statsLoading={statsLoading}
            statsError={statsError}
            onAddChapter={handleAddChapter}
            onCreateAssignment={() => setActiveTab('assignments')}
            onCreateQuiz={() => setActiveTab('quizzes')}
            onTabChange={setActiveTab}
          />
        );
      case 'chapters':
        return (
          <ChaptersTab
            courseId={courseId}
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
            courseId={courseId}
          />
        );
      case 'quizzes':
        return (
          <QuizzesTab
            courseId={courseId}
          />
        );
      case 'faculty':
        return (
          <FacultyTab
            courseId={courseId || ''}
            faculty={faculty}
            onAddFaculty={handleAddFaculty}
            onRemoveFaculty={handleRemoveFaculty}
            onTransferOwnership={handleTransferOwnership}
            onFacultyUpdate={handleFacultyUpdate}
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
        title={course.title}
        description={course.description}
        thumbnail={course.thumbnail}
        onEditCourse={handleEditCourse}
      />

      {/* Navigation Tabs */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={availableTabs}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-visible">
        {renderActiveTab()}
      </div>
    </div>
  );
}
