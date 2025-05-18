import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Faculty } from '../../types';
import { FiUser, FiX } from 'react-icons/fi';

interface FacultyTabProps {
  faculty: Faculty[];
  onAddFaculty: () => void;
  onRemoveFaculty: (facultyId: string) => void;
}

export default function FacultyTab({
  faculty,
  onAddFaculty,
  onRemoveFaculty
}: FacultyTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Faculty removal confirmation modal states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [facultyToRemove, setFacultyToRemove] = useState<{id: string, name: string} | null>(null);
  const [removeConfirmation, setRemoveConfirmation] = useState('');

  const handleAddFaculty = () => {
    if (facultyEmail.trim() && facultyName.trim()) {
      console.log('Adding faculty:', { name: facultyName, email: facultyEmail });
      // Here you would actually add the faculty member
      onAddFaculty();
      setFacultyEmail('');
      setFacultyName('');
      setShowAddModal(false);
    }
  };
  
  const handleRemoveClick = (facultyId: string) => {
    const member = faculty.find(f => f.id === facultyId);
    if (member) {
      setFacultyToRemove({ id: member.id, name: member.name });
      setRemoveConfirmation('');
      setShowRemoveModal(true);
    }
  };
  
  const handleConfirmRemove = () => {
    if (facultyToRemove && removeConfirmation === facultyToRemove.name) {
      onRemoveFaculty(facultyToRemove.id);
      setShowRemoveModal(false);
      setFacultyToRemove(null);
      setRemoveConfirmation('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Faculty</h2>
        <button
          onClick={() => {
            setShowAddModal(true);
            setTimeout(() => emailInputRef.current?.focus(), 100);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <FiUser size={18} />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Faculty</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="faculty-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty Name
                </label>
                <input
                  id="faculty-name"
                  type="text"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              <div>
                <label htmlFor="faculty-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Faculty Email
                </label>
                <input
                  ref={emailInputRef}
                  id="faculty-email"
                  type="email"
                  value={facultyEmail}
                  onChange={(e) => setFacultyEmail(e.target.value)}
                  placeholder="faculty@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFaculty}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Add Faculty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Faculty Remove Confirmation Modal */}
      {showRemoveModal && facultyToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-600">Remove Faculty</h3>
              <button 
                onClick={() => setShowRemoveModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone. This will remove the faculty member 
                  from this course.
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                To confirm, type <strong className="font-medium">{facultyToRemove.name}</strong> in the field below:
              </p>
              
              <input
                type="text"
                value={removeConfirmation}
                onChange={(e) => setRemoveConfirmation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                autoFocus
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemove}
                  disabled={removeConfirmation !== facultyToRemove.name}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
                    removeConfirmation === facultyToRemove.name 
                      ? 'hover:bg-red-700 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Remove Faculty
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      onClick={() => handleRemoveClick(member.id)}
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1 cursor-pointer"
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
} 