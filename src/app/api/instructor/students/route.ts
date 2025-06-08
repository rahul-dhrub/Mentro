import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Ensure models are registered
    Course;
    User;

    // First, get the instructor's MongoDB user ID
    const instructor = await User.findOne({ clerkId: userId });
    if (!instructor) {
      return NextResponse.json({ message: 'Instructor not found' }, { status: 404 });
    }

    // Debug: Check all courses in database
    const allCourses = await Course.find({}).select('_id title instructorId enrolledStudents').limit(5);
 
    // Find all courses owned by this instructor (using instructorId field)
    const instructorCourses = await Course.find({ 
      instructorId: instructor._id 
    }).select('_id title enrolledStudents');

    if (!instructorCourses || instructorCourses.length === 0) {
      return NextResponse.json({
        students: [],
        totalStudents: 0,
        totalCourses: 0,
        courses: []
      });
    }

    // Collect all unique student IDs across all courses
    const studentIdMap = new Map();
    const courseData = [];

    for (const course of instructorCourses) {
      const enrolledStudents = course.enrolledStudents || [];
      
      // Track course info
      courseData.push({
        id: course._id.toString(),
        title: course.title,
        studentCount: enrolledStudents.length
      });

      // Collect unique students with their lesson progress per course
      for (const enrollment of enrolledStudents) {
        const studentId = enrollment.userId;
        
        if (!studentIdMap.has(studentId)) {
          studentIdMap.set(studentId, {
            userId: studentId,
            courses: [],
            totalLessonsCompleted: 0,
            totalCoursesEnrolled: 0
          });
        }
        
        const studentData = studentIdMap.get(studentId);
        studentData.courses.push({
          courseId: course._id.toString(),
          courseTitle: course.title,
          lessonsCompleted: enrollment.lessonsCompleted || 0
        });
        studentData.totalLessonsCompleted += (enrollment.lessonsCompleted || 0);
        studentData.totalCoursesEnrolled += 1;
      }
    }

    // Get detailed user information for all unique students
    const uniqueStudentIds = Array.from(studentIdMap.keys());
    
    const studentsDetails = await User.find({
      _id: { $in: uniqueStudentIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).select('_id name email profilePicture department role lastActive createdAt');
    

    // Combine student details with enrollment data
    const enrichedStudents = studentsDetails.map(student => {
      const enrollmentData = studentIdMap.get(student._id.toString());
      
      return {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        profilePicture: student.profilePicture || '',
        department: student.department || 'N/A',
        role: student.role,
        lastActive: student.lastActive,
        enrolledAt: student.createdAt,
        totalCoursesEnrolled: enrollmentData.totalCoursesEnrolled,
        totalLessonsCompleted: enrollmentData.totalLessonsCompleted,
        courses: enrollmentData.courses
      };
    });

    // Sort students by total lessons completed (descending) and then by name
    enrichedStudents.sort((a, b) => {
      if (b.totalLessonsCompleted !== a.totalLessonsCompleted) {
        return b.totalLessonsCompleted - a.totalLessonsCompleted;
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      students: enrichedStudents,
      totalStudents: enrichedStudents.length,
      totalCourses: instructorCourses.length,
      courses: courseData,
      instructor: {
        id: instructor._id.toString(),
        name: instructor.name,
        email: instructor.email
      }
    });

  } catch (error) {
    console.error('Error fetching instructor students:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 