import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure Course model is registered
    Course;
    
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    // Find user by Clerk ID and populate related data
    const user = await User.findOne({ clerkId })
      .populate('ownedCourseIds', 'title students rating')
      .populate('enrolledCourseIds', 'title')
      .lean() as any;
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate total students across all owned courses
    const totalStudents = user.ownedCourseIds?.reduce((sum: number, course: any) => {
      return sum + (course.students?.length || 0);
    }, 0) || 0;

    // Calculate average rating from owned courses
    const ownedCourses = user.ownedCourseIds as any[];
    const averageRating = ownedCourses?.length > 0 
      ? ownedCourses.reduce((sum: number, course: any) => sum + (course.rating || 0), 0) / ownedCourses.length
      : 0;

    // Transform user data for frontend
    const profileData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      title: user.title || 'Faculty Member',
      bio: user.bio || '',
      profileImage: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`,
      bannerImage: user.bannerImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      location: user.location || '',
      joinDate: user.createdAt?.toISOString().split('T')[0] || '',
      dateOfBirth: user.dateOfBirth || '',
      expertise: user.expertise || [],
      achievements: user.achievements || [],
      introVideo: user.introVideo || '',
      social: {
        github: user.social?.github || '',
        linkedin: user.social?.linkedin || '',
        website: user.social?.website || ''
      },
      stats: {
        totalCourses: ownedCourses?.length || 0,
        totalStudents: totalStudents,
        completedCourses: user.enrolledCourseIds?.length || 0,
        inProgressCourses: 0, // This would need additional logic to calculate
        averageRating: Math.round(averageRating * 10) / 10,
        totalHours: user.totalHours || 0
      },
      recentActivity: [] // This would be populated from activity logs if needed
    };
    
    return NextResponse.json({ profile: profileData }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure Course model is registered
    Course;
    
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate and sanitize input data
    const updateData: any = {};
    
    // Basic profile fields
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined) updateData.email = body.email.toLowerCase().trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.bio !== undefined) updateData.bio = body.bio.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth;
    if (body.profileImage !== undefined) updateData.profilePicture = body.profileImage;
    if (body.bannerImage !== undefined) updateData.bannerImage = body.bannerImage;
    if (body.introVideo !== undefined) updateData.introVideo = body.introVideo;
    
    // Array fields
    if (body.expertise !== undefined) {
      updateData.expertise = Array.isArray(body.expertise) 
        ? body.expertise.map((item: string) => item.trim()).filter(Boolean)
        : [];
    }
    
    if (body.achievements !== undefined) {
      updateData.achievements = Array.isArray(body.achievements)
        ? body.achievements.map((item: string) => item.trim()).filter(Boolean)
        : [];
    }
    
    // Social links
    if (body.social !== undefined) {
      updateData.social = {
        github: body.social.github?.trim() || '',
        linkedin: body.social.linkedin?.trim() || '',
        website: body.social.website?.trim() || ''
      };
    }
    
    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { 
        new: true, 
        runValidators: true,
        lean: true
      }
    ) as any;
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return updated profile data in the same format as GET
    const profileData = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      role: updatedUser.role,
      title: updatedUser.title || 'Faculty Member',
      bio: updatedUser.bio || '',
      profileImage: updatedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&background=0D8ABC&color=fff`,
      bannerImage: updatedUser.bannerImage || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      location: updatedUser.location || '',
      joinDate: updatedUser.createdAt?.toISOString().split('T')[0] || '',
      dateOfBirth: updatedUser.dateOfBirth || '',
      expertise: updatedUser.expertise || [],
      achievements: updatedUser.achievements || [],
      introVideo: updatedUser.introVideo || '',
      social: {
        github: updatedUser.social?.github || '',
        linkedin: updatedUser.social?.linkedin || '',
        website: updatedUser.social?.website || ''
      },
      stats: {
        totalCourses: updatedUser.ownedCourseIds?.length || 0,
        totalStudents: updatedUser.totalStudents || 0,
        completedCourses: updatedUser.enrolledCourseIds?.length || 0,
        inProgressCourses: 0,
        averageRating: updatedUser.averageRating || 0,
        totalHours: updatedUser.totalHours || 0
      },
      recentActivity: []
    };
    
    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: profileData 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 