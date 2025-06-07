'use client';

import { useState, useEffect } from 'react';
import { FiX, FiUser, FiUserMinus, FiUserX } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  title?: string;
  department?: string;
  bio?: string;
}

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  type: 'followers' | 'following';
  currentUserId?: string; // Current logged-in user's ID for permission checks
  onCountChange?: (newCount: number) => void; // Callback when counts change
  onUserSelect?: (userId: string) => void; // Callback when user is clicked
}

export default function FollowersModal({ 
  isOpen, 
  onClose, 
  userId, 
  userName, 
  type,
  currentUserId,
  onCountChange,
  onUserSelect
}: FollowersModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/${type}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data[type] || []);
      } else {
        console.error(`Error fetching ${type}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFollower = async (followerId: string) => {
    if (!currentUserId || currentUserId !== userId) return; // Only allow removing from own followers
    
    setActionLoading(followerId);
    try {
      const response = await fetch(`/api/users/${followerId}/follow`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        const updatedUsers = users.filter(user => user.id !== followerId);
        setUsers(updatedUsers);
        
        // Notify parent of count change
        if (onCountChange) {
          onCountChange(updatedUsers.length);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to remove follower');
      }
    } catch (error) {
      console.error('Error removing follower:', error);
      alert('Failed to remove follower. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfollow = async (followingUserId: string) => {
    if (!currentUserId) return;
    
    setActionLoading(followingUserId);
    try {
      const response = await fetch(`/api/users/${followingUserId}/follow`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state
        const updatedUsers = users.filter(user => user.id !== followingUserId);
        setUsers(updatedUsers);
        
        // Notify parent of count change
        if (onCountChange) {
          onCountChange(updatedUsers.length);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to unfollow user');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Failed to unfollow user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUserClick = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user.id);
      onClose(); // Close the modal when user is selected
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {userName}'s {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div 
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                        {user.name}
                      </p>
                      {user.title && (
                        <p className="text-xs text-gray-500 truncate">
                          {user.title}
                          {user.department && ` • ${user.department}`}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action buttons - only show for current user's own lists */}
                  {currentUserId && (
                    <div className="flex items-center space-x-2">
                      {type === 'followers' && currentUserId === userId && (
                        <button
                          onClick={() => handleRemoveFollower(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove follower"
                        >
                          {actionLoading === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiUserMinus size={16} />
                          )}
                        </button>
                      )}
                      
                      {type === 'following' && currentUserId === userId && (
                        <button
                          onClick={() => handleUnfollow(user.id)}
                          disabled={actionLoading === user.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Unfollow"
                        >
                          {actionLoading === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiUserX size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FiUser size={48} className="mb-3" />
              <p className="text-sm">
                {type === 'followers' 
                  ? `${userName} has no followers yet` 
                  : `${userName} is not following anyone yet`
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer with count */}
        {!isLoading && users.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-white">
            <p className="text-sm text-gray-600 text-center">
              {users.length} {type === 'followers' ? 'follower' : 'following'}{users.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 