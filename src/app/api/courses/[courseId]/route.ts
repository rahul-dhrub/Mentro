import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import mongoose from 'mongoose';

// GET /api/courses/[courseId] - Get a single course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectDB();
    
    // Import User model
    const User = (await import('@/models/User')).default;
    
    const { courseId } = await params;
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    // Try to find course by MongoDB _id first, then by code
    let course;
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      course = await Course.findById(courseId).populate('instructorId', 'name profilePicture title department');
    }
    
    // If not found by ID, try by course code
    if (!course) {
      course = await Course.findOne({ code: courseId.toUpperCase() }).populate('instructorId', 'name profilePicture title department');
    }
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Use populated instructor data
    const instructorData = course.instructorId ? {
      name: (course.instructorId as any).name || 'Unknown Instructor',
      image: (course.instructorId as any).profilePicture || 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
      rating: 0, // This could be calculated from course reviews
      reviews: 0 // This could be calculated from course reviews
    } : {
      name: 'Unknown Instructor',
      image: 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
      rating: 0,
      reviews: 0
    };
    
    // Transform course to match frontend interface
    const transformedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      instructor: instructorData,
      rating: course.rating,
      reviews: course.reviews,
      students: course.totalStudents,
      price: course.price,
      originalPrice: course.originalPrice,
      thumbnail: course.thumbnail || 'https://wpassets.brainstation.io/app/uploads/2021/10/24135334/Web-Dev.jpg',
      category: course.category,
      level: course.level,
      duration: course.duration,
      lastUpdated: course.updatedAt,
      features: course.features,
      requirements: course.requirements,
      whatYouWillLearn: course.whatYouWillLearn,
      isPublished: course.isPublished,
      curriculum: [] // TODO: Populate from chapters/lessons
    };
    
    return NextResponse.json({
      success: true,
      data: transformedCourse
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
} 