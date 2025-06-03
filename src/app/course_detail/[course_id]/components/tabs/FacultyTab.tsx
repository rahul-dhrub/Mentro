import React, { useState, useRef } from 'react';
import { Faculty } from '../../types';
import { FiUser, FiX, FiUserCheck, FiLoader } from 'react-icons/fi';
import { facultyAPI } from '@/lib/api/faculty';
import Avatar from '@/components/ui/Avatar';
import { useUsersData } from '@/hooks/useUserData';

interface FacultyTabProps {
  courseId: string;
  faculty: Faculty[];
  onAddFaculty: (facultyData: { name: string; email: string; role: 'owner' | 'faculty' }) => void;
  onRemoveFaculty: (facultyId: string) => void;
  onTransferOwnership: (newOwnerEmail: string) => void;
  onFacultyUpdate: (faculty: Faculty[]) => void;
}

export default function FacultyTab({
  courseId,
  faculty,
  onAddFaculty,
  onRemoveFaculty,
  onTransferOwnership,
  onFacultyUpdate
}: FacultyTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  
  // Faculty removal confirmation modal states
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [facultyToRemove, setFacultyToRemove] = useState<{id: string, name: string} | null>(null);
  const [removeConfirmation, setRemoveConfirmation] = useState('');
  
  // Transfer ownership modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [transferConfirmation, setTransferConfirmation] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user data for all faculty members
  const facultyEmails = faculty.map(member => member.email);
  const { getUserData } = useUsersData(facultyEmails);

  // Component for rendering faculty avatar
  const FacultyAvatar = ({ member }: { member: Faculty }) => {
    const userData = getUserData(member.email);
    return (
      <Avatar 
        name={member.name}
        imageUrl={userData?.profilePicture || member.avatar}
        size="medium"
      />
    );
  };

  const handleAddFaculty = async () => {
    if (facultyEmail.trim() && facultyName.trim()) {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if there's currently no owner
        const hasOwner = faculty.some(member => member.role === 'owner');
        const role = hasOwner ? 'faculty' : 'owner';
        
        const result = await facultyAPI.addFaculty(courseId, {
          name: facultyName.trim(),
          email: facultyEmail.trim(),
          role,
        });
        
        if (result.success && result.data) {
          onFacultyUpdate(result.data);
          setFacultyEmail('');
          setFacultyName('');
          setShowAddModal(false);
        } else {
          setError(result.error || 'Failed to add faculty member');
        }
      } catch (error) {
        setError('An unexpected error occurred');
        console.error('Error adding faculty:', error);
      } finally {
        setIsLoading(false);
      }
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
  
  const handleConfirmRemove = async () => {
    if (facultyToRemove && removeConfirmation === facultyToRemove.name) {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await facultyAPI.removeFaculty(courseId, facultyToRemove.id);
        
        if (result.success && result.data) {
          onFacultyUpdate(result.data);
          setShowRemoveModal(false);
          setFacultyToRemove(null);
          setRemoveConfirmation('');
        } else {
          setError(result.error || 'Failed to remove faculty member');
        }
      } catch (error) {
        setError('An unexpected error occurred');
        console.error('Error removing faculty:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTransferOwnership = async () => {
    if (newOwnerEmail.trim() && transferConfirmation === 'transfer ownership') {
      try {
        setIsLoading(true);
        setError(null);
        
        const result = await facultyAPI.transferOwnership(courseId, newOwnerEmail.trim());
        
        if (result.success && result.data) {
          onFacultyUpdate(result.data);
          setShowTransferModal(false);
          setNewOwnerEmail('');
          setTransferConfirmation('');
        } else {
          setError(result.error || 'Failed to transfer ownership');
        }
      } catch (error) {
        setError('An unexpected error occurred');
        console.error('Error transferring ownership:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTransferClick = () => {
    setNewOwnerEmail('');
    setTransferConfirmation('');
    setShowTransferModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Faculty</h2>
        <button
          onClick={() => {
            setError(null); // Clear any previous errors
            setShowAddModal(true);
            setTimeout(() => emailInputRef.current?.focus(), 100);
          }}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiUser size={18} />
          <span>Add Faculty</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}

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
              
              {/* Show notification if this will be the first faculty (owner) */}
              {!faculty.some(member => member.role === 'owner') && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> This faculty member will be assigned as the course owner since no owner exists yet.
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFaculty}
                  disabled={isLoading || !facultyName.trim() || !facultyEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading && <FiLoader className="animate-spin" size={16} />}
                  <span>{isLoading ? 'Adding...' : 'Add Faculty'}</span>
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
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemove}
                  disabled={isLoading || removeConfirmation !== facultyToRemove.name}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-2 ${
                    !isLoading && removeConfirmation === facultyToRemove.name
                      ? 'hover:bg-red-700 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isLoading && <FiLoader className="animate-spin" size={16} />}
                  <span>{isLoading ? 'Removing...' : 'Remove Faculty'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-orange-600">Transfer Ownership</h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <p className="text-sm text-orange-700">
                  <strong>Warning:</strong> This action cannot be undone. You will lose ownership privileges 
                  and the new owner will have full control over this course.
                </p>
              </div>
              
              <div>
                <label htmlFor="new-owner-email" className="block text-sm font-medium text-gray-700 mb-1">
                  New Owner Email *
                </label>
                <input
                  id="new-owner-email"
                  type="email"
                  value={newOwnerEmail}
                  onChange={(e) => setNewOwnerEmail(e.target.value)}
                  placeholder="newowner@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  To confirm, type <strong className="font-medium">transfer ownership</strong> in the field below:
                </p>
                <input
                  type="text"
                  value={transferConfirmation}
                  onChange={(e) => setTransferConfirmation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                  placeholder="transfer ownership"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowTransferModal(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTransferOwnership}
                  disabled={isLoading || !newOwnerEmail.trim() || transferConfirmation !== 'transfer ownership'}
                  className={`px-4 py-2 bg-orange-600 text-white rounded-lg flex items-center space-x-2 ${
                    !isLoading && newOwnerEmail.trim() && transferConfirmation === 'transfer ownership'
                      ? 'hover:bg-orange-700 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {isLoading && <FiLoader className="animate-spin" size={16} />}
                  <span>{isLoading ? 'Transferring...' : 'Transfer Ownership'}</span>
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
                  <FacultyAvatar member={member} />
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
                  {member.role === 'owner' ? (
                    <button
                      onClick={handleTransferClick}
                      className="text-orange-600 hover:text-orange-900 flex items-center space-x-1 cursor-pointer"
                      title="Transfer Ownership"
                    >
                      <FiUserCheck size={16} />
                      <span className="text-sm">Transfer Ownership</span>
                    </button>
                  ) : (
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