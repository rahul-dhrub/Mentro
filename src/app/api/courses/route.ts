import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';

// GET /api/courses - Get all courses with optional filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Import User model
    const User = (await import('@/models/User')).default;
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Build filter object
    let filter: any = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }
    
    if (isPublished !== null) {
      filter.isPublished = isPublished === 'true';
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Fetch courses with pagination and populate instructor
    const courses = await Course
      .find(filter)
      .populate('instructorId', 'name profilePicture title department')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filter);
    
    // Transform courses to match frontend interface
    const transformedCourses = courses.map(course => {
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

      return {
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
        lastUpdated: course.lastUpdated || course.updatedAt,
        features: course.features,
        requirements: course.requirements,
        whatYouWillLearn: course.whatYouWillLearn,
        isPublished: course.isPublished,
        curriculum: [] // Will be populated from chapters/lessons if needed
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedCourses,
      pagination: {
        page,
        limit,
        total: totalCourses,
        pages: Math.ceil(totalCourses / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course
export async function POST(request: NextRequest) {
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
    
    // Fetch current user details
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const {
      title,
      description,
      code,
      category,
      level,
      duration,
      price,
      originalPrice,
      thumbnail,
      features,
      requirements,
      whatYouWillLearn
    } = body;
    
    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Course title is required' },
        { status: 400 }
      );
    }
    
    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: 'Course code is required' },
        { status: 400 }
      );
    }
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Course category is required' },
        { status: 400 }
      );
    }
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return NextResponse.json(
        { success: false, error: 'Course code already exists' },
        { status: 409 }
      );
    }
    
    // Create new course with instructor information from current user
    const newCourse = new Course({
      title: title.trim(),
      description: description || '',
      code: code.toUpperCase().trim(),
      instructorId: currentUser._id,
      category,
      level: level || 'Beginner',
      duration: duration || '',
      price: price || 0,
      originalPrice: originalPrice || price || 0,
      thumbnail: thumbnail || 'https://wpassets.brainstation.io/app/uploads/2021/10/24135334/Web-Dev.jpg',
      features: features || [],
      requirements: requirements || [],
      whatYouWillLearn: whatYouWillLearn || [],
      isPublished: false,
      isActive: true,
      createdBy: userId,
      faculty: [],
      students: [],
      chapters: [],
      // Initialize new rating and review fields
      ratings: [],
      reviewIds: [],
      lastUpdated: new Date()
    });
    
    await newCourse.save();
    
    // Add the course to the instructor's ownedCourseIds
    await currentUser.addOwnedCourse(newCourse._id);
    
    // Transform response to match frontend interface
    const transformedCourse = {
      id: newCourse._id.toString(),
      title: newCourse.title,
      description: newCourse.description,
      instructor: {
        name: currentUser.name,
        image: currentUser.profilePicture || 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
        rating: 0,
        reviews: 0
      },
      rating: newCourse.rating,
      reviews: newCourse.reviews,
      students: newCourse.totalStudents,
      price: newCourse.price,
      originalPrice: newCourse.originalPrice,
      thumbnail: newCourse.thumbnail,
      category: newCourse.category,
      level: newCourse.level,
      duration: newCourse.duration,
      lastUpdated: newCourse.lastUpdated || newCourse.updatedAt,
      features: newCourse.features,
      requirements: newCourse.requirements,
      whatYouWillLearn: newCourse.whatYouWillLearn,
      isPublished: newCourse.isPublished,
      curriculum: []
    };
    
    return NextResponse.json({
      success: true,
      data: transformedCourse,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 