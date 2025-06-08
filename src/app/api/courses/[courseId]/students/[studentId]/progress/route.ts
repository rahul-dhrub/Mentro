import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import Course from '@/models/Course';
import User from '@/models/User';

// PUT - Update student progress (lessons completed)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; studentId: string }> }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { lessonsCompleted } = await request.json();
    const { courseId, studentId } = await params;

    if (typeof lessonsCompleted !== 'number' || lessonsCompleted < 0) {
      return NextResponse.json({ message: 'Invalid lessons completed value' }, { status: 400 });
    }

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    await connectDB();

    // Find the course
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
    
    // Ensure lessons completed doesn't exceed total lessons
    const validLessonsCompleted = Math.min(lessonsCompleted, totalLessons);
    const progress = totalLessons > 0 ? Math.round((validLessonsCompleted / totalLessons) * 100) : 0;

    // Find and update the student's progress in the course
    const studentIndex = course.enrolledStudents?.findIndex(
      (student: any) => student.userId === studentId
    );

    if (studentIndex === undefined || studentIndex === -1) {
      return NextResponse.json({ message: 'Student not found in course' }, { status: 404 });
    }

    // Update the student's progress
    course.enrolledStudents[studentIndex].lessonsCompleted = validLessonsCompleted;
    
    await course.save();

    // Also update the user's enrolled courses if they exist and User model supports it
    try {
      const isObjectId = mongoose.Types.ObjectId.isValid(studentId);
      let user;
      
      if (isObjectId) {
        user = await User.findById(studentId);
      } else {
        user = await User.findOne({ email: studentId });
      }

      if (user && 'enrolledCourses' in user) {
        const enrolledCourses = (user as any).enrolledCourses || [];
        const courseIndex = enrolledCourses.findIndex((ec: any) => ec.courseId === courseId);
        
        if (courseIndex !== -1) {
          enrolledCourses[courseIndex].lessonsCompleted = validLessonsCompleted;
          enrolledCourses[courseIndex].progress = progress;
          (user as any).enrolledCourses = enrolledCourses;
          await user.save();
        }
      }
    } catch (error) {
      console.log('Could not update user enrolled courses:', error);
    }

    return NextResponse.json({
      message: 'Student progress updated successfully',
      lessonsCompleted: validLessonsCompleted,
      totalLessons,
      progress
    });

  } catch (error) {
    console.error('Error updating student progress:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 