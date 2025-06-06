import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// GET /api/user/me - Get current user's details
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const user = await User.findOne({ clerkId: userId })
      .populate('ownedCourseIds', 'title code category totalStudents rating isPublished')
      .populate('enrolledCourseIds', 'title code category instructorId isPublished');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Transform user data for response
    const userData = {
      id: user._id.toString(),
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      title: user.title,
      department: user.department,
      role: user.role,
      isOnline: user.isOnline,
      lastActive: user.lastActive,
      
      // Statistics and relationships
      ratings: user.ratings,
      averageRating: user.averageRating,
      totalReviews: user.totalReviews,
      totalStudents: user.totalStudents,
      
      // Course relationships
      ownedCourses: user.ownedCourseIds?.map((course: any) => ({
        id: course._id?.toString(),
        title: course.title,
        code: course.code,
        category: course.category,
        totalStudents: course.totalStudents,
        rating: course.rating,
        isPublished: course.isPublished
      })) || [],
      
      enrolledCourses: user.enrolledCourseIds?.map((course: any) => ({
        id: course._id?.toString(),
        title: course.title,
        code: course.code,
        category: course.category,
        isPublished: course.isPublished
      })) || [],
      
      reviewIds: user.reviewIds.map((id: any) => id.toString()),
      
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    return NextResponse.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
} 