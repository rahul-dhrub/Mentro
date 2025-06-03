'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/app/admin/components/AdminLayout';
import AnalyticsDashboard from '@/app/admin/components/AnalyticsDashboard';
import OnlineUsersList from '@/app/admin/components/OnlineUsersList';
import UsersManagement from '@/app/admin/components/UsersManagement';

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isLoaded) {
        return; // Still loading, don't do anything yet
      }

      if (!user) {
        setLoading(false);
        return; // User not signed in, show sign-in prompt
      }

      try {
        // Try to get user role
        const response = await fetch('/api/user/role');
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please sign in to access admin portal');
            setLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.error('Non-JSON response:', textResponse);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        console.log('User role response:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (data.role === 'admin') {
          setUserRole('admin');
        } else {
          setError(`Access denied. User role: ${data.role || 'student'}`);
        }
      } catch (error: any) {
        console.error('Error checking user role:', error);
        setError(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user, isLoaded, router]);

  // Show loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <div className="text-blue-500 text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal Access</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the admin dashboard</p>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign In to Continue
            </button>
          </SignInButton>
          <div className="mt-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {/* Show admin setup option if user is not admin */}
          {error.includes('User role:') && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Need Admin Access?</h3>
              <p className="text-sm text-yellow-700 mb-3">
                If you should have admin access, click below to promote your account:
              </p>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/setup', { method: 'POST' });
                    const data = await response.json();
                    if (response.ok) {
                      alert('Admin setup successful! Please refresh the page.');
                      window.location.reload();
                    } else {
                      alert(`Setup failed: ${data.error}`);
                    }
                  } catch (err) {
                    alert('Setup failed. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
              >
                Setup Admin Access
              </button>
            </div>
          )}
          
          {/* Show refresh button for other errors */}
          {!error.includes('User role:') && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
            >
              Retry
            </button>
          )}
          
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  // Show full admin dashboard if user is admin
  if (userRole === 'admin') {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage your platform with comprehensive analytics and user management tools.
            </p>
            <div className="mt-2 text-sm text-green-600">
              ✅ Signed in as: {user?.emailAddresses[0]?.emailAddress}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users Management
              </button>
              <button
                onClick={() => setActiveTab('online')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'online'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Online Users
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'users' && <UsersManagement />}
            {activeTab === 'online' && <OnlineUsersList />}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return null;
} 