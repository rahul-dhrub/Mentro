import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import Quiz from '@/models/Quiz';
import Assignment from '@/models/Assignment';
import Blog from '@/models/Blog';
import Post from '@/models/Post';
import ActivityLog from '@/models/ActivityLog';

// Helper function to check if user is admin
async function isAdmin() {
  try {
    const user = await currentUser();
    if (!user) return false;
    
    await connectDB();
    const dbUser = await User.findOne({ clerkId: user.id });
    return dbUser?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 1d, 7d, 30d, 90d
    
    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get basic counts
    const [
      totalUsers,
      onlineUsers,
      newUsers,
      totalCourses,
      totalLessons,
      totalQuizzes,
      totalAssignments,
      totalBlogs,
      totalPosts,
      recentActivities
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Course.countDocuments(),
      Lesson.countDocuments(),
      Quiz.countDocuments(),
      Assignment.countDocuments(),
      Blog.countDocuments(),
      Post.countDocuments(),
      ActivityLog.find({ createdAt: { $gte: startDate } })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(50)
    ]);
    
    // Get user role distribution
    const userRoleDistribution = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get activity trends (daily activity for the time range)
    const activityTrends = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activities: {
            $push: {
              action: '$_id.action',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get most active users
    const mostActiveUsers = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 },
          userName: { $first: '$userName' },
          userEmail: { $first: '$userEmail' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get content creation stats
    const contentStats = await ActivityLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          action: { $in: ['course_create', 'lesson_create', 'quiz_create', 'assignment_create', 'blog_create', 'post_create'] }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get online users with details
    const onlineUsersDetails = await User.find({ isOnline: true })
      .select('name email department role lastActive')
      .sort({ lastActive: -1 })
      .limit(20);
    
    const analytics = {
      overview: {
        totalUsers,
        onlineUsers,
        newUsers,
        totalCourses,
        totalLessons,
        totalQuizzes,
        totalAssignments,
        totalBlogs,
        totalPosts
      },
      userRoleDistribution,
      activityTrends,
      mostActiveUsers,
      contentStats,
      onlineUsersDetails,
      recentActivities: recentActivities.slice(0, 20)
    };
    
    return NextResponse.json({ analytics });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 