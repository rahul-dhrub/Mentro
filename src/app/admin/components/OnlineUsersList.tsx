'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiClock, FiRefreshCw } from 'react-icons/fi';

interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  lastSeenMs: number;
  lastActiveFormatted: string;
}

interface OnlineUsersResponse {
  users: OnlineUser[];
  total: number;
  onlineCount: number;
  awayCount: number;
  timestamp: string;
}

export default function OnlineUsersList() {
  const [data, setData] = useState<OnlineUsersResponse>({
    users: [],
    total: 0,
    onlineCount: 0,
    awayCount: 0,
    timestamp: ''
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOnlineUsers();
    
    // Set up auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchOnlineUsers, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/online-users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      setData(responseData);
    } catch (error) {
      console.error('Error fetching online users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOnlineUsers();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        );
      case 'away':
        return (
          <span className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        );
      default:
        return (
          <span className="relative flex h-3 w-3">
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
          </span>
        );
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      default:
        return 'Offline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'away':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Online Users</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <span>{data.total} total users</span>
            <span className="text-green-600">• {data.onlineCount} online</span>
            <span className="text-yellow-600">• {data.awayCount} away</span>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Online Users Grid */}
      {data.users.length === 0 ? (
        <div className="text-center py-12">
          <FiUser className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users online</h3>
          <p className="mt-1 text-sm text-gray-500">
            No users are currently active on the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.users.map((user) => (
            <div key={user.userId} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {getStatusIndicator(user.status)}
                  <span className={`text-xs font-medium ${getStatusColor(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Role</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Department</span>
                  <span className="text-xs text-gray-900">{user.department}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center">
                    <FiClock className="h-3 w-3 mr-1" />
                    Last Active
                  </span>
                  <span className="text-xs text-gray-900">
                    {user.lastActiveFormatted}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Auto-refresh indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Auto-refreshes every 10 seconds • Last updated: {data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Never'}
        </p>
      </div>
    </div>
  );
} 