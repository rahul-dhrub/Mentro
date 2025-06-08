'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { 
  FiUser, 
  FiBook, 
  FiMail, 
  FiCalendar, 
  FiTrendingUp, 
  FiFilter,
  FiSearch,
  FiUsers,
  FiAward,
  FiArrowLeft,
  FiLoader,
  FiEye,
  FiX
} from 'react-icons/fi';
import Image from 'next/image';
import UserProfile from '../feed/components/UserProfile';

interface StudentCourse {
  courseId: string;
  courseTitle: string;
  lessonsCompleted: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
  department: string;
  role: string;
  lastActive: string;
  enrolledAt: string;
  totalCoursesEnrolled: number;
  totalLessonsCompleted: number;
  courses: StudentCourse[];
}

interface CourseInfo {
  id: string;
  title: string;
  studentCount: number;
}

interface StudentsData {
  students: Student[];
  totalStudents: number;
  totalCourses: number;
  courses: CourseInfo[];
  instructor: {
    id: string;
    name: string;
    email: string;
  };
}

export default function StudentsPage() {
  const [studentsData, setStudentsData] = useState<StudentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'courses' | 'lessons' | 'recent'>('lessons');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  // Fetch current user data
  useEffect(() => {
    if (isLoaded && userId) {
      fetchCurrentUser();
      fetchStudentsData();
    }
  }, [isLoaded, userId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`/api/users/profile?clerkId=${userId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setCurrentUser({
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=0D8ABC&color=fff`,
            title: data.user.title || 'Faculty Member',
            department: data.user.department || 'Computer Science'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/instructor/students', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students data');
      }

      const data = await response.json();
      setStudentsData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort students
  const getFilteredAndSortedStudents = () => {
    if (!studentsData) return [];

    let filtered = studentsData.students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(student =>
        student.courses.some(course => course.courseId === selectedCourse)
      );
    }

    // Sort students
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'courses':
        filtered.sort((a, b) => b.totalCoursesEnrolled - a.totalCoursesEnrolled);
        break;
      case 'lessons':
        filtered.sort((a, b) => b.totalLessonsCompleted - a.totalLessonsCompleted);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
        break;
    }

    return filtered;
  };

  const handleBack = () => {
    router.push('/feed');
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setViewMode('profile');
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    setViewMode('list');
  };

  // Handlers for UserProfile interactions
  const handleLike = async (postId: string) => {
    // TODO: Implement like functionality
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string, content: string) => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', postId, content);
  };

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  const handleUserSelect = (userId: string) => {
    // Navigate to another user's profile
    const student = studentsData?.students.find(s => s.id === userId);
    if (student) {
      setSelectedStudent(student);
    }
  };

  const handleDelete = async (postId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete post:', postId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <FiLoader className="animate-spin text-blue-600" size={24} />
          <span className="text-gray-600">Loading students...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading students</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={fetchStudentsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredStudents = getFilteredAndSortedStudents();

  // Show UserProfile when a student is selected
  if (viewMode === 'profile' && selectedStudent && currentUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with Back Button */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToList}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Student Profile</h1>
                <p className="text-gray-600">Back to Students List</p>
              </div>
            </div>
          </div>
        </div>

        {/* UserProfile Component */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <UserProfile
            userId={selectedStudent.id}
            currentUser={currentUser}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onUserSelect={handleUserSelect}
            onDelete={handleDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <FiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Students</h1>
                <p className="text-gray-600">
                  Manage students across all your courses
                </p>
              </div>
            </div>
            
            {studentsData && (
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{studentsData.totalStudents}</div>
                  <div className="text-sm text-gray-500">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{studentsData.totalCourses}</div>
                  <div className="text-sm text-gray-500">Active Courses</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Course Filter */}
              <div className="flex items-center space-x-2">
                <FiFilter size={18} className="text-gray-500" />
                              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                  <option value="all">All Courses</option>
                  {studentsData?.courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.studentCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="lessons">Most Lessons</option>
                <option value="courses">Most Courses</option>
                <option value="name">Name A-Z</option>
                <option value="recent">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Student Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div 
                  className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
                  onClick={() => handleViewStudent(student)}
                >
                  {student.profilePicture ? (
                    <Image
                      src={student.profilePicture}
                      alt={student.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="text-gray-500" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleViewStudent(student)}
                  >
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{student.department}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiBook className="text-blue-500" size={16} />
                    <span className="text-sm text-gray-600">Courses</span>
                  </div>
                  <span className="font-semibold text-gray-900">{student.totalCoursesEnrolled}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiAward className="text-green-500" size={16} />
                    <span className="text-sm text-gray-600">Lessons</span>
                  </div>
                  <span className="font-semibold text-gray-900">{student.totalLessonsCompleted}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="text-purple-500" size={16} />
                    <span className="text-sm text-gray-600">Last Active</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(student.lastActive).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleViewStudent(student)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FiEye size={16} />
                <span>View Details</span>
              </button>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCourse !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No students are enrolled in your courses yet'}
            </p>
          </div>
        )}
      </div>


    </div>
  );
} 