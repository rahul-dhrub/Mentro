import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import User from '@/models/User';

// GET - Fetch user's courses for profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure models are registered
    Course;
    User;
    
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Find user by Clerk ID to get their _id
    const user = await User.findOne({ clerkId }).lean() as any;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get courses where user is the instructor
    const courses = await Course.find({
      $or: [
        { instructorId: user._id },
        { createdBy: clerkId }
      ]
    }).lean();

    // Transform courses data for frontend
    const coursesArray = Array.isArray(courses) ? courses : [];
    const transformedCourses = coursesArray.map((course: any) => ({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      students: course.totalStudents || course.students?.length || 0,
      rating: course.rating || 0,
      price: course.price || 0,
      category: course.category
    }));
    
    return NextResponse.json({ courses: transformedCourses }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching user courses:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 