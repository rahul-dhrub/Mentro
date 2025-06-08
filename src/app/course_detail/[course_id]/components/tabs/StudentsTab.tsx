import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiX, FiLoader, FiCircle, FiClock } from 'react-icons/fi';

interface Student {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  progress: number;
  lastActivity: string;
  status: 'active' | 'inactive';
  lessonsCompleted: number;
  enrolledAt: string;
  // Online status from heartbeat system
  onlineStatus?: 'online' | 'away' | 'offline';
  lastSeen?: string;
  lastActiveFormatted?: string;
}

interface StudentsTabProps {
  courseId: string;
  onExportList: () => void;
  onViewStudentDetails: (studentId: string) => void;
  onViewStudentProfile: (studentId: string) => void;
}

export default function StudentsTab({
  courseId,
  onExportList,
  onViewStudentDetails,
  onViewStudentProfile
}: StudentsTabProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [onlineStatusData, setOnlineStatusData] = useState<Map<string, any>>(new Map());
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Fetch online status for students using heartbeat system
  const fetchStudentOnlineStatus = async (updateStudentsImmediately = false) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/students/online-status`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const statusMap = new Map();
        
        data.students.forEach((student: any) => {
          statusMap.set(student.userId, {
            onlineStatus: student.status,
            lastSeen: student.lastSeen,
            lastActiveFormatted: student.lastActiveFormatted
          });
        });
        
        setOnlineStatusData(statusMap);
        
        // If students are already loaded and we want immediate update
        if (updateStudentsImmediately && students.length > 0) {
          const updatedStudents = students.map(student => {
            const onlineInfo = statusMap.get(student.id) || {};
            return {
              ...student,
              ...onlineInfo
            };
          });
          setStudents(updatedStudents);
        }
        
        console.log('Online status fetched:', data);
      }
    } catch (error) {
      console.error('Error fetching online status:', error);
    }
  };

  // Helper function to calculate progress consistently
  const calculateProgress = (lessonsCompleted: number, totalLessons: number): number => {
    if (totalLessons === 0) {
      console.log('Progress calculation: totalLessons is 0, returning 0%');
      return 0;
    }
    const progress = Math.round((lessonsCompleted / totalLessons) * 100);
    console.log(`Progress calculation: ${lessonsCompleted}/${totalLessons} = ${progress}%`);
    return progress;
  };

  // Helper component for online status indicator
  const OnlineStatusIndicator = ({ status, lastActiveFormatted }: { 
    status?: 'online' | 'away' | 'offline', 
    lastActiveFormatted?: string 
  }) => {
    if (!status) return null;

    const getStatusColor = () => {
      switch (status) {
        case 'online': return 'text-green-500';
        case 'away': return 'text-yellow-500';
        case 'offline': return 'text-gray-400';
        default: return 'text-gray-400';
      }
    };

    const getStatusIcon = () => {
      switch (status) {
        case 'online': return <FiCircle className={`w-3 h-3 ${getStatusColor()}`} fill="currentColor" />;
        case 'away': return <FiClock className={`w-3 h-3 ${getStatusColor()}`} />;
        case 'offline': return <FiCircle className={`w-3 h-3 ${getStatusColor()}`} />;
        default: return <FiCircle className={`w-3 h-3 ${getStatusColor()}`} />;
      }
    };

    return (
      <div className="flex items-center space-x-1" title={`${status.charAt(0).toUpperCase() + status.slice(1)} - ${lastActiveFormatted || 'Unknown'}`}>
        {getStatusIcon()}
        <span className={`text-xs ${getStatusColor()}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    );
  };

  // Fetch chapters and calculate total lessons
  const fetchChaptersAndCalculateLessons = async (): Promise<number> => {
    try {
      console.log('Fetching chapters for courseId:', courseId);
      
      // Try multiple possible API endpoints
      let response;
      let chapters = [];
      
      // First try the chapters API
      try {
        response = await fetch(`/api/courses/${courseId}/chapters`, {
          credentials: 'include'
        });
        
        console.log('Chapters API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Raw chapters API response:', JSON.stringify(data, null, 2));
          chapters = data.chapters || data || [];
          console.log('Processed chapters from /chapters endpoint:', chapters);
        } else {
          const errorText = await response.text();
          console.log('Chapters API error:', errorText);
        }
      } catch (err) {
        console.log('Chapters API error:', err);
      }
      
      // If chapters API fails, try getting chapters from course data
      if (chapters.length === 0) {
        try {
          response = await fetch(`/api/courses/${courseId}`, {
            credentials: 'include'
          });
          
          console.log('Course API response status:', response.status);
          
          if (response.ok) {
            const courseData = await response.json();
            console.log('Raw course API response:', JSON.stringify(courseData, null, 2));
            chapters = courseData.course?.chapters || courseData.chapters || [];
            console.log('Processed chapters from course API:', chapters);
          } else {
            const errorText = await response.text();
            console.log('Course API error:', errorText);
          }
        } catch (err) {
          console.log('Course API error:', err);
        }
      }
      
      // Also try chapters as a direct property
      if (chapters.length === 0) {
        try {
          response = await fetch(`/api/chapters?courseId=${courseId}`, {
            credentials: 'include'
          });
          
          console.log('Direct chapters API response status:', response.status);
          
          if (response.ok) {
            const chaptersData = await response.json();
            console.log('Raw direct chapters API response:', JSON.stringify(chaptersData, null, 2));
            chapters = chaptersData.chapters || chaptersData || [];
            console.log('Processed chapters from direct chapters API:', chapters);
          }
        } catch (err) {
          console.log('Direct chapters API error:', err);
        }
      }
      
      console.log('Final chapters data:', chapters);
      console.log('Number of chapters found:', chapters.length);
      
      // Calculate total lessons from all chapters
      let totalLessonCount = 0;
      
      chapters.forEach((chapter: any, index: number) => {
        console.log(`Chapter ${index}:`, chapter);
        
        // Check different possible lesson properties
        if (chapter.lessons && Array.isArray(chapter.lessons)) {
          totalLessonCount += chapter.lessons.length;
          console.log(`Added ${chapter.lessons.length} lessons from chapter.lessons`);
        } else if (chapter.lectures && Array.isArray(chapter.lectures)) {
          totalLessonCount += chapter.lectures.length;
          console.log(`Added ${chapter.lectures.length} lessons from chapter.lectures`);
        } else if (chapter.content && Array.isArray(chapter.content)) {
          totalLessonCount += chapter.content.length;
          console.log(`Added ${chapter.content.length} lessons from chapter.content`);
        } else {
          console.log('No lessons found in chapter:', Object.keys(chapter));
        }
      });
      
      console.log('Total lessons calculated:', totalLessonCount);
      setTotalLessons(totalLessonCount);
      return totalLessonCount;
      
    } catch (error) {
      console.error('Error fetching chapters:', error);
      // Set to 0 if unable to fetch chapters
      setTotalLessons(0);
      return 0;
    }
  };

  // Fetch enrolled students from database
  const fetchStudents = async (currentTotalLessons?: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/courses/${courseId}/students`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      // Use the passed totalLessons or current state
      const lessonsCount = currentTotalLessons !== undefined ? currentTotalLessons : totalLessons;
      
      // Update students with calculated progress and online status
      const updatedStudents = (data.students || []).map((student: any) => {
        const onlineInfo = onlineStatusData.get(student.id) || {};
        return {
          ...student,
          totalLessons: lessonsCount,
          progress: calculateProgress(student.lessonsCompleted || 0, lessonsCount),
          ...onlineInfo
        };
      });
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Load chapters and students on component mount
  useEffect(() => {
    if (courseId) {
      const loadData = async () => {
        // Run these in parallel for faster loading
        const [lessonsCount] = await Promise.all([
          fetchChaptersAndCalculateLessons(),
          fetchStudentOnlineStatus()
        ]);
        
        // Then fetch students with the correct lesson count
        await fetchStudents(lessonsCount);
      };
      loadData();
    }
  }, [courseId]);

  // Set up polling for online status updates
  useEffect(() => {
    if (courseId) {
      // Initial fetch
      fetchStudentOnlineStatus();
      
      // Poll every 10 seconds for more responsive updates
      const interval = setInterval(() => {
        fetchStudentOnlineStatus(true); // Update students immediately when polling
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [courseId]);

  // Update students when totalLessons changes
  useEffect(() => {
    if (totalLessons > 0 && students.length > 0) {
      const updatedStudents = students.map(student => ({
        ...student,
        totalLessons: totalLessons,
        progress: calculateProgress(student.lessonsCompleted || 0, totalLessons)
      }));
      setStudents(updatedStudents);
    }
  }, [totalLessons]);

  // Update students when online status data changes
  useEffect(() => {
    if (students.length > 0 && onlineStatusData.size > 0) {
      const updatedStudents = students.map(student => {
        const onlineInfo = onlineStatusData.get(student.id) || {};
        return {
          ...student,
          ...onlineInfo
        };
      });
      setStudents(updatedStudents);
    }
  }, [onlineStatusData]);

  // Enroll a new student
  const handleEnrollStudent = async () => {
    if (!studentEmail.trim()) return;

    try {
      setEnrolling(true);
      setError(null);

      // First, fetch the user with the given email
      const userResponse = await fetch(`/api/users/by-email?email=${encodeURIComponent(studentEmail.trim())}`, {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('User not found with this email address');
      }

      const userData = await userResponse.json();
      const userId = userData.user._id || userData.user.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      // Now enroll the student using their user ID
      const response = await fetch(`/api/courses/${courseId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userId,
          lessonsCompleted: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll student');
      }

      const data = await response.json();
      
      // Add the new student to the list with calculated total lessons and progress
      const newStudent = {
        ...data.student,
        totalLessons: totalLessons,
        progress: calculateProgress(data.student.lessonsCompleted || 0, totalLessons)
      };
      setStudents(prev => [...prev, newStudent]);
      
      // Reset form
      setStudentEmail('');
      setShowEnrollModal(false);
      
    } catch (error: any) {
      console.error('Error enrolling student:', error);
      setError(error.message || 'Failed to enroll student');
    } finally {
      setEnrolling(false);
    }
  };



  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-600">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
        <h2 className="text-xl font-semibold text-gray-900">Enrolled Students</h2>
          <p className="text-sm text-gray-600 mt-1">
            {students.length} students enrolled • {totalLessons} total lessons
          </p>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <FiCircle className="w-3 h-3 text-green-500" fill="currentColor" />
              <span className="text-xs text-green-600">
                {students.filter(s => s.onlineStatus === 'online').length} Online
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FiClock className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600">
                {students.filter(s => s.onlineStatus === 'away').length} Away
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FiCircle className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {students.filter(s => s.onlineStatus === 'offline' || !s.onlineStatus).length} Offline
              </span>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setShowEnrollModal(true);
              setTimeout(() => emailInputRef.current?.focus(), 100);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <FiUser size={18} />
            <span>Enroll Student</span>
          </button>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-500"
          />
          <button 
            onClick={onExportList}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Export List
          </button>
        </div>
      </div>
      
      {/* Student Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Enroll New Student</h3>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                disabled={enrolling}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="student-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email
                </label>
                <input
                  ref={emailInputRef}
                  id="student-email"
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  disabled={enrolling}
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  disabled={enrolling}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollStudent}
                  disabled={enrolling || !studentEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {enrolling && <FiLoader className="animate-spin" size={16} />}
                  <span>{enrolling ? 'Enrolling...' : 'Enroll Student'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Student table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lessons</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
                        onClick={() => onViewStudentProfile(student.id)}
                        title={`View ${student.name}'s profile`}
                      >
                        {student.profilePicture ? (
                          <img 
                            src={student.profilePicture} 
                            alt={`${student.name}'s profile`}
                            className="h-full w-full object-cover rounded-full"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<svg className="text-gray-500" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                            }}
                          />
                        ) : (
                          <FiUser className="text-gray-500" size={20} />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => onViewStudentProfile(student.id)}
                            title={`View ${student.name}'s profile`}
                          >
                            {student.name}
                          </div>
                          <OnlineStatusIndicator 
                            status={student.onlineStatus} 
                            lastActiveFormatted={student.lastActiveFormatted} 
                          />
                        </div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{student.progress}% Complete</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.lessonsCompleted} / {totalLessons}
                    </div>
                    <div className="text-xs text-gray-500">
                       lessons completed
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.lastActivity).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onViewStudentDetails(student.id)}
                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'No students match your search' : 'No students enrolled yet'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 