import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Review from '@/models/Review';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: userId } = await params;

    // Fetch user to verify they exist and get their role
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let stats = {
      totalCourses: 0,
      totalStudents: 0,
      averageRating: 0,
      totalHours: 0,
      totalReviews: 0
    };

    // Only fetch detailed stats for instructors
    if (user.role === 'instructor') {
      // Get all courses owned by this instructor
      const courses = await Course.find({ createdBy: userId });
      
      // Calculate total courses
      stats.totalCourses = courses.length;
      
      // Calculate total students across all courses
      stats.totalStudents = courses.reduce((total, course) => {
        return total + (course.enrolledStudents?.length || 0);
      }, 0);
      
      // Calculate total hours from course durations
      stats.totalHours = courses.reduce((total, course) => {
        const duration = typeof course.duration === 'number' ? course.duration : 0;
        return total + duration;
      }, 0);
      
      // Get rating data from reviews where this user is the target
      const reviews = await Review.find({ targetUserId: userId });
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        stats.averageRating = totalRating / reviews.length;
        stats.totalReviews = reviews.length;
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 