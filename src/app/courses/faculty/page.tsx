'use client';

import { useState } from 'react';
import { FiBook, FiCalendar, FiUsers, FiFileText, FiPlus, FiEdit2, FiTrash2, FiClock, FiBarChart2, FiVideo, FiDownload, FiUpload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import CourseSidebar from './components/CourseSidebar';
import CourseHeader from './components/CourseHeader';
import CourseDetails from './components/CourseDetails';
import CalendarView from './components/CalendarView';
import Navbar from './components/Navbar';
import { Course, Assignment, Recording, CalendarEvent, LiveClass } from './types';

interface Class {
  id: string;
  courseId: string;
  title: string;
  time: string;
  room: string;
  students: number;
}

interface Test {
  id: string;
  courseId: string;
  title: string;
  date: string;
  duration: string;
  totalMarks: number;
  submissions: number;
}

export default function FacultyCoursesPage() {
  const [activeTab, setActiveTab] = useState<'courses' | 'classes' | 'tests'>('courses');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'details' | 'calendar'>('details');

  // Mock data
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Computer Science',
      code: 'CS101',
      students: 45,
      progress: 75,
      nextClass: {
        time: '10:00 AM',
        room: 'Room 101'
      }
    },
    {
      id: '2',
      title: 'Data Structures and Algorithms',
      code: 'CS201',
      students: 38,
      progress: 60,
      nextClass: {
        time: '2:00 PM',
        room: 'Room 203'
      }
    }
  ];

  const classes: Class[] = [
    {
      id: '1',
      courseId: '1',
      title: 'Introduction to Neural Networks',
      time: '10:00 AM - 11:30 AM',
      room: 'CS-101',
      students: 35
    },
    {
      id: '2',
      courseId: '2',
      title: 'Binary Search Trees',
      time: '2:00 PM - 3:30 PM',
      room: 'CS-203',
      students: 42
    }
  ];

  const tests: Test[] = [
    {
      id: '1',
      courseId: '1',
      title: 'Midterm Examination',
      date: '2024-03-15',
      duration: '2 hours',
      totalMarks: 100,
      submissions: 32
    },
    {
      id: '2',
      courseId: '2',
      title: 'Data Structures Quiz',
      date: '2024-03-20',
      duration: '1 hour',
      totalMarks: 50,
      submissions: 38
    }
  ];

  const mockAssignments: Assignment[] = [
    {
      id: '1',
      title: 'Week 1 Quiz',
      dueDate: new Date('2024-03-20'),
      submissions: 35,
      totalStudents: 45
    },
    {
      id: '2',
      title: 'Programming Assignment 1',
      dueDate: new Date('2024-03-25'),
      submissions: 28,
      totalStudents: 45
    }
  ];

  const mockRecordings: Recording[] = [
    {
      id: '1',
      title: 'Lecture 1: Introduction',
      date: new Date('2024-03-15'),
      duration: '1:30:00',
      views: 42
    },
    {
      id: '2',
      title: 'Lecture 2: Basic Concepts',
      date: new Date('2024-03-17'),
      duration: '1:45:00',
      views: 38
    }
  ];

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Lecture: Introduction',
      date: new Date('2024-03-15'),
      type: 'class',
      time: '10:00 AM',
      room: 'Room 101'
    },
    {
      id: '2',
      title: 'Assignment Due: Week 1 Quiz',
      date: new Date('2024-03-20'),
      type: 'assignment'
    }
  ];

  const mockLiveClasses: LiveClass[] = [
    {
      id: '1',
      title: 'Introduction to Neural Networks',
      date: new Date('2024-03-20'),
      time: '10:00 AM',
      duration: '1 hour',
      room: 'Virtual Room 1',
      status: 'scheduled',
      participants: 0,
      maxParticipants: 50
    },
    {
      id: '2',
      title: 'Deep Learning Basics',
      date: new Date('2024-03-19'),
      time: '2:00 PM',
      duration: '1.5 hours',
      room: 'Virtual Room 2',
      status: 'live',
      participants: 35,
      maxParticipants: 50
    },
    {
      id: '3',
      title: 'Machine Learning Fundamentals',
      date: new Date('2024-03-18'),
      time: '11:00 AM',
      duration: '1 hour',
      room: 'Virtual Room 1',
      status: 'ended',
      participants: 42,
      maxParticipants: 50,
      recordingUrl: 'https://example.com/recording-1'
    }
  ];

  const getEventsForDate = (date: Date) => {
    return mockEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      return 'has-events';
    }
    return '';
  };

  const tileContent = ({ date }: { date: Date }) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      return (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
        </div>
      );
    }
    return null;
  };

  const handleAddAssignment = () => {
    // TODO: Implement add assignment
    console.log('Add assignment');
  };

  const handleEditAssignment = (assignment: Assignment) => {
    // TODO: Implement edit assignment
    console.log('Edit assignment', assignment);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    // TODO: Implement delete assignment
    console.log('Delete assignment', assignment);
  };

  const handleAddRecording = () => {
    // TODO: Implement add recording
    console.log('Add recording');
  };

  const handleEditRecording = (recording: Recording) => {
    // TODO: Implement edit recording
    console.log('Edit recording', recording);
  };

  const handleDeleteRecording = (recording: Recording) => {
    // TODO: Implement delete recording
    console.log('Delete recording', recording);
  };

  const handleAddEvent = () => {
    // TODO: Implement add event
    console.log('Add event');
  };

  const handleEditEvent = (event: CalendarEvent) => {
    // TODO: Implement edit event
    console.log('Edit event', event);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    // TODO: Implement delete event
    console.log('Delete event', event);
  };

  const handleAddLiveClass = () => {
    // TODO: Implement add live class
    console.log('Add live class');
  };

  const handleEditLiveClass = (liveClass: LiveClass) => {
    // TODO: Implement edit live class
    console.log('Edit live class', liveClass);
  };

  const handleDeleteLiveClass = (liveClass: LiveClass) => {
    // TODO: Implement delete live class
    console.log('Delete live class', liveClass);
  };

  const handleJoinLiveClass = (liveClass: LiveClass) => {
    // TODO: Implement join live class
    console.log('Join live class', liveClass);
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar onCreateNew={handleCreateNew} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 border-r border-gray-200 bg-white">
          <CourseSidebar
            courses={mockCourses}
            activeTab={activeTab}
            selectedCourse={selectedCourse}
            onTabChange={setActiveTab}
            onCourseSelect={setSelectedCourse}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {selectedCourse ? (
            <div className="p-6 space-y-6">
              <CourseHeader
                course={selectedCourse}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onEdit={() => console.log('Edit course', selectedCourse)}
                onDelete={() => console.log('Delete course', selectedCourse)}
              />

              {viewMode === 'details' ? (
                <CourseDetails
                  course={selectedCourse}
                  assignments={mockAssignments}
                  recordings={mockRecordings}
                  liveClasses={mockLiveClasses}
                  onAddAssignment={handleAddAssignment}
                  onEditAssignment={handleEditAssignment}
                  onDeleteAssignment={handleDeleteAssignment}
                  onAddRecording={handleAddRecording}
                  onEditRecording={handleEditRecording}
                  onDeleteRecording={handleDeleteRecording}
                  onAddLiveClass={handleAddLiveClass}
                  onEditLiveClass={handleEditLiveClass}
                  onDeleteLiveClass={handleDeleteLiveClass}
                  onJoinLiveClass={handleJoinLiveClass}
                />
              ) : (
                <CalendarView
                  events={mockEvents}
                  onAddEvent={handleAddEvent}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a course to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New {activeTab.slice(0, -1)}</h2>
            {/* Add form fields based on activeTab */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
