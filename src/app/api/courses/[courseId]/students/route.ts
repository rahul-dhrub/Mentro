import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import Course from '@/models/Course';
import User from '@/models/User';

// GET - Fetch enrolled students for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { courseId } = await params;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    // Fetch the course and its enrolled students
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Get total lessons count from curriculum
    const totalLessons = course.curriculum?.reduce((total, section) => {
      return total + (section.sections?.reduce((sectionTotal, subsection) => {
        return sectionTotal + (subsection.lectures?.length || 0);
      }, 0) || 0);
    }, 0) || 0;

    // Format student data by fetching user details
    const students = await Promise.all(
      (course.enrolledStudents || []).map(async (student: any) => {
        const progress = totalLessons > 0 ? Math.round((student.lessonsCompleted / totalLessons) * 100) : 0;

        // Fetch user details
        const userDetails = await User.findById(student.userId);

        return {
          id: student.userId,
          name: userDetails?.name || 'Unknown Student',
          email: userDetails?.email || 'No email',
          profilePicture: userDetails?.profilePicture || '',
          progress,
          lessonsCompleted: student.lessonsCompleted || 0,
          totalLessons,
          lastActivity: userDetails?.lastActive || new Date(),
          status: 'active',
          enrolledAt: userDetails?.createdAt || new Date()
        };
      })
    );

    return NextResponse.json({
      students,
      total: students.length
    });

  } catch (error) {
    console.error('Error fetching course students:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Enroll a new student in the course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId: studentUserId, lessonsCompleted } = await request.json();
    const { courseId } = await params;

    if (!studentUserId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    await connectDB();

    // Check if course exists
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Check if student is already enrolled
    const existingStudent = course.enrolledStudents?.find(
      (student: any) => student.userId === studentUserId
    );

    if (existingStudent) {
      return NextResponse.json(
        { message: 'Student is already enrolled in this course' },
        { status: 409 }
      );
    }

    // Check if user exists in users collection
    const userDetails = await User.findById(studentUserId);

    if (!userDetails) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Create student enrollment record
    const newStudent = {
      userId: studentUserId,
      lessonsCompleted: lessonsCompleted || 0
    };

    // Add student to course's enrolledStudents array
    course.enrolledStudents = course.enrolledStudents || [];
    course.enrolledStudents.push(newStudent);
    await course.save();

    // If user exists, also add the course to their enrolledCourses (if User model supports it)
    if (userDetails) {
      try {
        // Check if User model has enrolledCourses field
        if ('enrolledCourses' in userDetails) {
          const enrolledCourses = (userDetails as any).enrolledCourses || [];
          const isAlreadyEnrolled = enrolledCourses.some((ec: any) => ec.courseId === courseId);
          
          if (!isAlreadyEnrolled) {
            enrolledCourses.push({
              courseId: courseId,
              enrolledAt: new Date(),
              progress: 0,
              lessonsCompleted: 0
            });
            (userDetails as any).enrolledCourses = enrolledCourses;
            await userDetails.save();
          }
        }
      } catch (error) {
        console.log('User model may not support enrolledCourses field:', error);
      }
    }

    // Get total lessons count from curriculum
    const totalLessons = course.curriculum?.reduce((total, section) => {
      return total + (section.sections?.reduce((sectionTotal, subsection) => {
        return sectionTotal + (subsection.lectures?.length || 0);
      }, 0) || 0);
    }, 0) || 0;

    const responseStudent = {
      id: newStudent.userId,
      name: userDetails.name,
      email: userDetails.email,
      profilePicture: userDetails.profilePicture || '',
      progress: 0,
      lessonsCompleted: newStudent.lessonsCompleted,
      totalLessons,
      lastActivity: userDetails.lastActive.toISOString(),
      status: 'active',
      enrolledAt: userDetails.createdAt.toISOString()
    };

    return NextResponse.json({
      message: 'Student enrolled successfully',
      student: responseStudent
    }, { status: 201 });

  } catch (error) {
    console.error('Error enrolling student:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 