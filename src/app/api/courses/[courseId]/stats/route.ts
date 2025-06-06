import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import mongoose from 'mongoose';

// GET /api/courses/[courseId]/stats - Get course statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate if courseId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Calculate stats (for now using mock data, but this would query actual data)
    // In a real implementation, you would:
    // 1. Count enrolled students
    // 2. Calculate completion rates from user progress
    // 3. Get recent activity from activity logs
    // 4. Calculate ratings from reviews
    
    const stats = {
      totalStudents: course.totalStudents || 0,
      completionRate: 75, // Mock data - would calculate from actual progress
      averageRating: course.rating || 0,
      newAssignmentSubmissions: 12, // Mock data - would query submissions
      quizCompletions: 25, // Mock data - would query quiz attempts
      newEnrollments: 8, // Mock data - would query recent enrollments
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching course stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course statistics' },
      { status: 500 }
    );
  }
} 