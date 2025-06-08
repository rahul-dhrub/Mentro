import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';

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

    let courses: any[] = [];

    // Only fetch courses for instructors
    if (user.role === 'instructor') {
      const rawCourses = await Course.find({ createdBy: userId })
        .select('title description thumbnail price category rating isPublished enrolledStudents createdAt')
        .sort({ createdAt: -1 });

      // Transform courses to match expected format
      courses = rawCourses.map(course => ({
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail || '',
        students: course.enrolledStudents?.length || 0,
        rating: course.rating || 0,
        price: course.price || 0,
        category: course.category || 'General'
      }));
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 