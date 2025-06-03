'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiEye, FiUserPlus, FiBook, FiFileText, FiMessageSquare, FiActivity } from 'react-icons/fi';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    onlineUsers: number;
    newUsers: number;
    totalCourses: number;
    totalLessons: number;
    totalQuizzes: number;
    totalAssignments: number;
    totalBlogs: number;
    totalPosts: number;
  };
  userRoleDistribution: Array<{ _id: string; count: number }>;
  activityTrends: Array<{
    _id: string;
    totalCount: number;
    activities: Array<{ action: string; count: number }>;
  }>;
  mostActiveUsers: Array<{
    _id: string;
    count: number;
    userName: string;
    userEmail: string;
  }>;
  contentStats: Array<{ _id: string; count: number }>;
  recentActivities: Array<{
    _id: string;
    action: string;
    userName: string;
    userEmail: string;
    details: string;
    createdAt: string;
  }>;
}

const StatCard = ({ title, value, icon: Icon, change }: {
  title: string;
  value: number;
  icon: any;
  change?: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
          <dd className="text-lg font-medium text-gray-900">{value.toLocaleString()}</dd>
        </dl>
      </div>
    </div>
    {change && (
      <div className="mt-2">
        <span className="text-sm text-green-600">{change}</span>
      </div>
    )}
  </div>
);

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="1d">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers}
          icon={FiUsers}
        />
        <StatCard
          title="Online Users"
          value={analytics.overview.onlineUsers}
          icon={FiEye}
        />
        <StatCard
          title="New Users"
          value={analytics.overview.newUsers}
          icon={FiUserPlus}
        />
        <StatCard
          title="Total Courses"
          value={analytics.overview.totalCourses}
          icon={FiBook}
        />
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Lessons"
          value={analytics.overview.totalLessons}
          icon={FiFileText}
        />
        <StatCard
          title="Total Quizzes"
          value={analytics.overview.totalQuizzes}
          icon={FiActivity}
        />
        <StatCard
          title="Total Assignments"
          value={analytics.overview.totalAssignments}
          icon={FiFileText}
        />
        <StatCard
          title="Total Posts"
          value={analytics.overview.totalPosts}
          icon={FiMessageSquare}
        />
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Role Distribution</h3>
          <div className="space-y-3">
            {analytics.userRoleDistribution.map((role) => (
              <div key={role._id} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {role._id}s
                </span>
                <span className="text-sm text-gray-900">{role.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Users */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
          <div className="space-y-3">
            {analytics.mostActiveUsers.slice(0, 5).map((user) => (
              <div key={user._id} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.userName}</p>
                  <p className="text-xs text-gray-500">{user.userEmail}</p>
                </div>
                <span className="text-sm text-gray-600">{user.count} activities</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Trends</h3>
        <div className="space-y-2">
          {analytics.activityTrends.slice(0, 7).map((trend) => (
            <div key={trend._id} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-700">{trend._id}</span>
              <span className="text-sm font-medium text-gray-900">{trend.totalCount} activities</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {analytics.recentActivities.slice(0, 10).map((activity) => (
            <div key={activity._id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FiActivity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.userName}</span>{' '}
                  {activity.action.replace('_', ' ')}
                </p>
                <p className="text-xs text-gray-500">{activity.details}</p>
                <p className="text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 