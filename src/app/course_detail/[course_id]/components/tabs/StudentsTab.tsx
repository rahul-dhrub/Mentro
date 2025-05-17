import React, { useState, useRef } from 'react';
import { FiUser, FiX } from 'react-icons/fi';

interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  lastActivity: string;
  status: 'active' | 'inactive';
}

interface StudentsTabProps {
  students: Student[];
  onExportList: () => void;
  onViewStudentDetails: (studentId: string) => void;
}

export default function StudentsTab({
  students,
  onExportList,
  onViewStudentDetails
}: StudentsTabProps) {
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleEnrollStudent = () => {
    if (studentEmail.trim()) {
      console.log('Enrolling student with email:', studentEmail);
      // Here you would actually enroll the student
      setStudentEmail('');
      setShowEnrollModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Enrolled Students</h2>
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
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollStudent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Enroll Student
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{student.progress}% Complete</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.lastActivity}
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
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No students enrolled yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 