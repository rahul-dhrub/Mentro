'use client';

import { useState } from 'react';
import { FiBook, FiFileText, FiClock, FiVideo, FiEdit2, FiTrash2, FiPlus, FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';
import CourseHeader from './components/CourseHeader';
import TabNavigation from './components/TabNavigation';
import OverviewTab from './components/tabs/OverviewTab';
import ChaptersTab from './components/tabs/ChaptersTab';
import AssignmentsTab from './components/tabs/AssignmentsTab';
import QuizzesTab from './components/tabs/QuizzesTab';
import { Chapter, Assignment, Quiz, Faculty } from './types';

export default function FacultyCourseDetail({ params }: { params: { course_id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');
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

  // Event handlers
  const handleEditCourse = () => {
    // Implement course editing functionality
    console.log('Edit course clicked');
  };

  const handleAddChapter = () => {
    // Implement chapter addition logic
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
    // Implement chapter editing logic
    console.log('Edit chapter:', chapterId);
  };

  const handleDeleteChapter = (chapterId: string) => {
    // Implement chapter deletion logic
    console.log('Delete chapter:', chapterId);
  };

  const handleAddLesson = (chapterId: string) => {
    // Implement lesson addition logic
    console.log('Add lesson to chapter:', chapterId);
  };

  const handleEditLesson = (chapterId: string, lessonId: string) => {
    // Implement lesson editing logic
    console.log('Edit lesson:', lessonId, 'in chapter:', chapterId);
  };

  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    // Implement lesson deletion logic
    console.log('Delete lesson:', lessonId, 'from chapter:', chapterId);
  };

  const handleAddAssignment = () => {
    // Implement assignment addition logic
    console.log('Add assignment clicked');
  };

  const handleEditAssignment = (assignmentId: string) => {
    // Implement assignment editing logic
    console.log('Edit assignment:', assignmentId);
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    // Implement assignment deletion logic
    console.log('Delete assignment:', assignmentId);
  };

  const handleAddQuiz = () => {
    // Implement quiz addition logic
    console.log('Add quiz clicked');
  };

  const handleEditQuiz = (quizId: string) => {
    // Implement quiz editing logic
    console.log('Edit quiz:', quizId);
  };

  const handleDeleteQuiz = (quizId: string) => {
    // Implement quiz deletion logic
    console.log('Delete quiz:', quizId);
  };

  const handleAddFaculty = () => {
    // Implement faculty addition logic
    console.log('Add faculty clicked');
  };

  const handleRemoveFaculty = (facultyId: string) => {
    // Implement faculty removal logic
    console.log('Remove faculty:', facultyId);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            onAddChapter={handleAddChapter}
            onCreateAssignment={handleAddAssignment}
            onCreateQuiz={handleAddQuiz}
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
        return renderFacultyTab();
      case 'students':
        return renderStudentsTab();
      default:
        return null;
    }
  };

  // Temporary render functions for tabs that haven't been componentized yet
  const renderFacultyTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Faculty</h2>
        <button
          onClick={handleAddFaculty}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>Add Faculty</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {faculty.map((member) => (
            <div key={member.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden">
                    <Image
                      src={member.avatar || 'https://via.placeholder.com/150'}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                      {member.role === 'owner' && (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.email}</p>
                    <p className="text-xs text-gray-400">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveFaculty(member.id)}
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                    >
                      <span className="text-sm">Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Enrolled Students</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search students..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export List
          </button>
        </div>
      </div>
      {/* Simplified student table for now */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                    <div className="text-sm text-gray-500">john@example.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <span className="text-sm text-gray-500">75% Complete</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                2 hours ago
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900">View Details</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

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
