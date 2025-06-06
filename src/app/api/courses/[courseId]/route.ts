import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
      curriculum: course.curriculum || [] // Include curriculum data from database
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

// PUT /api/courses/[courseId] - Update a course
export async function PUT(
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

    // Import User model
    const User = (await import('@/models/User')).default;

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

    // Get current user details
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to edit this course
    const isOwner = course.instructorId.toString() === currentUser._id.toString();
    const isFaculty = course.faculty.some((f: any) => f.id === currentUser._id.toString());
    
    if (!isOwner && !isFaculty) {
      return NextResponse.json(
        { success: false, error: 'Permission denied. You can only edit courses you own or are faculty of.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      level,
      duration,
      price,
      originalPrice,
      thumbnail,
      features,
      requirements,
      whatYouWillLearn,
      curriculum
    } = body;

    // Validation
    if (title !== undefined && (!title || !title.trim())) {
      return NextResponse.json(
        { success: false, error: 'Course title cannot be empty' },
        { status: 400 }
      );
    }

    if (category !== undefined && !category) {
      return NextResponse.json(
        { success: false, error: 'Course category cannot be empty' },
        { status: 400 }
      );
    }

    // Update course fields
    const updateFields: any = {
      lastUpdated: new Date()
    };

    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (level !== undefined) updateFields.level = level;
    if (duration !== undefined) updateFields.duration = duration;
    if (price !== undefined) updateFields.price = price;
    if (originalPrice !== undefined) updateFields.originalPrice = originalPrice;
    if (thumbnail !== undefined) updateFields.thumbnail = thumbnail;
    if (features !== undefined) updateFields.features = features;
    if (requirements !== undefined) updateFields.requirements = requirements;
    if (whatYouWillLearn !== undefined) updateFields.whatYouWillLearn = whatYouWillLearn;
    if (curriculum !== undefined) updateFields.curriculum = curriculum;

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('instructorId', 'name profilePicture title department');

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, error: 'Failed to update course' },
        { status: 500 }
      );
    }

    // Transform response to match frontend interface
    const instructorData = updatedCourse.instructorId ? {
      name: (updatedCourse.instructorId as any).name || 'Unknown Instructor',
      image: (updatedCourse.instructorId as any).profilePicture || 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
      rating: 0, // This could be calculated from course reviews
      reviews: 0 // This could be calculated from course reviews
    } : {
      name: 'Unknown Instructor',
      image: 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
      rating: 0,
      reviews: 0
    };

    const transformedCourse = {
      id: updatedCourse._id.toString(),
      title: updatedCourse.title,
      description: updatedCourse.description,
      instructor: instructorData,
      rating: updatedCourse.rating,
      reviews: updatedCourse.reviews,
      students: updatedCourse.totalStudents,
      price: updatedCourse.price,
      originalPrice: updatedCourse.originalPrice,
      thumbnail: updatedCourse.thumbnail || 'https://wpassets.brainstation.io/app/uploads/2021/10/24135334/Web-Dev.jpg',
      category: updatedCourse.category,
      level: updatedCourse.level,
      duration: updatedCourse.duration,
      lastUpdated: updatedCourse.lastUpdated || updatedCourse.updatedAt,
      features: updatedCourse.features,
      requirements: updatedCourse.requirements,
      whatYouWillLearn: updatedCourse.whatYouWillLearn,
      isPublished: updatedCourse.isPublished,
      curriculum: updatedCourse.curriculum || []
    };

    return NextResponse.json({
      success: true,
      data: transformedCourse,
      message: 'Course updated successfully'
    });

  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[courseId] - Publish/Unpublish a course
export async function PATCH(
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

    // Import User model
    const User = (await import('@/models/User')).default;

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

    // Get current user details
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to publish this course
    const isOwner = course.instructorId.toString() === currentUser._id.toString();
    const isFaculty = course.faculty.some((f: any) => f.id === currentUser._id.toString());
    
    if (!isOwner && !isFaculty) {
      return NextResponse.json(
        { success: false, error: 'Permission denied. You can only publish courses you own or are faculty of.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isPublished } = body;

    // Validate isPublished field
    if (typeof isPublished !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isPublished must be a boolean value' },
        { status: 400 }
      );
    }

    // Update the course publication status
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { 
        isPublished,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    ).populate('instructorId', 'name profilePicture title department');

    if (!updatedCourse) {
      return NextResponse.json(
        { success: false, error: 'Failed to update course publication status' },
        { status: 500 }
      );
    }

    // Transform response to match frontend interface
    const instructorData = updatedCourse.instructorId ? {
      name: (updatedCourse.instructorId as any).name || 'Unknown Instructor',
      image: (updatedCourse.instructorId as any).profilePicture || 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
      rating: 0, // This could be calculated from course reviews
      reviews: 0 // This could be calculated from course reviews
    } : {
      name: 'Unknown Instructor',
      image: 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
      rating: 0,
      reviews: 0
    };

    const transformedCourse = {
      id: updatedCourse._id.toString(),
      title: updatedCourse.title,
      description: updatedCourse.description,
      instructor: instructorData,
      rating: updatedCourse.rating,
      reviews: updatedCourse.reviews,
      students: updatedCourse.totalStudents,
      price: updatedCourse.price,
      originalPrice: updatedCourse.originalPrice,
      thumbnail: updatedCourse.thumbnail || 'https://wpassets.brainstation.io/app/uploads/2021/10/24135334/Web-Dev.jpg',
      category: updatedCourse.category,
      level: updatedCourse.level,
      duration: updatedCourse.duration,
      lastUpdated: updatedCourse.lastUpdated || updatedCourse.updatedAt,
      features: updatedCourse.features,
      requirements: updatedCourse.requirements,
      whatYouWillLearn: updatedCourse.whatYouWillLearn,
      isPublished: updatedCourse.isPublished,
      curriculum: updatedCourse.curriculum || []
    };

    const action = isPublished ? 'published' : 'unpublished';
    
    return NextResponse.json({
      success: true,
      data: transformedCourse,
      message: `Course ${action} successfully`
    });

  } catch (error) {
    console.error('Error updating course publication status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update course publication status' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId] - Delete a course
export async function DELETE(
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

    // Import User model
    const User = (await import('@/models/User')).default;

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

    // Get current user details
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to delete this course
    const isOwner = course.instructorId.toString() === currentUser._id.toString();
    const isFaculty = course.faculty.some((f: any) => f.id === currentUser._id.toString());
    
    if (!isOwner && !isFaculty) {
      return NextResponse.json(
        { success: false, error: 'Permission denied. You can only delete courses you own or are faculty of.' },
        { status: 403 }
      );
    }

    // Only allow deletion of draft courses (unpublished)
    if (course.isPublished) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete published courses. Please unpublish the course first.' },
        { status: 400 }
      );
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId);

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
} 