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
      course = await Course.findById(courseId);
    }
    
    // If not found by ID, try by course code
    if (!course) {
      course = await Course.findOne({ code: courseId.toUpperCase() });
    }
    
    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Transform course to match frontend interface
    const transformedCourse = {
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      instructor: {
        name: course.instructor.name,
        image: course.instructor.image || 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
        rating: course.instructor.rating || 0,
        reviews: course.instructor.reviews || 0
      },
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