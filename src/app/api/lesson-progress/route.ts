import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import LessonProgress from '@/models/LessonProgress';
import Course from '@/models/Course';
import User from '@/models/User';
import { ensureModelsRegistered } from '@/lib/models';

// Helper function to update course progress
async function updateCourseProgress(userId: string, courseId: string, previousStatus: string, newStatus: string) {
  try {
    console.log('=== updateCourseProgress Debug ===');
    console.log('userId:', userId);
    console.log('courseId:', courseId);
    console.log('previousStatus:', previousStatus);
    console.log('newStatus:', newStatus);
    
    // Calculate the change in completed lessons
    let completedLessonsChange = 0;
    
    // If lesson was just completed
    if (newStatus === 'completed' && previousStatus !== 'completed') {
      completedLessonsChange = 1;
      console.log('Lesson completed: +1');
    }
    // If lesson was uncompleted (changed from completed to something else)
    else if (previousStatus === 'completed' && newStatus !== 'completed') {
      completedLessonsChange = -1;
      console.log('Lesson uncompleted: -1');
    } else {
      console.log('No change in completion status');
    }
    
    console.log('completedLessonsChange:', completedLessonsChange);
    
    // Only update if there's a change
    if (completedLessonsChange !== 0) {
      console.log('Fetching course...');
      const course = await Course.findById(courseId);
      
      if (!course) {
        console.log('Course not found with ID:', courseId);
        return;
      }
      
      console.log('Course found:', course.title);
      console.log('Enrolled students count:', course.enrolledStudents?.length || 0);
      
      // Convert Clerk user ID to MongoDB user ID
      console.log('Converting Clerk user ID to MongoDB user ID...');
      const mongoUser = await User.findOne({ clerkId: userId });
      
      if (!mongoUser) {
        console.log(`❌ MongoDB user not found for Clerk ID: ${userId}`);
        return;
      }
      
      const mongoUserId = mongoUser._id.toString();
      console.log(`✅ Found MongoDB user ID: ${mongoUserId} for Clerk ID: ${userId}`);
      
      if (course.enrolledStudents) {
        console.log('All enrolled students:');
        course.enrolledStudents.forEach((student: any, index: number) => {
          console.log(`  ${index}: userId=${student.userId}, lessonsCompleted=${student.lessonsCompleted}`);
        });
        
        // Find the student in enrolledStudents array using MongoDB user ID
        const studentIndex = course.enrolledStudents.findIndex(
          (student: any) => student.userId === mongoUserId
        );
        
        console.log('Student index found:', studentIndex);
        
        if (studentIndex !== -1) {
          // Update the lessonsCompleted count
          const currentCount = course.enrolledStudents[studentIndex].lessonsCompleted || 0;
          const newCount = Math.max(0, currentCount + completedLessonsChange);
          
          console.log(`Updating lessonsCompleted: ${currentCount} -> ${newCount}`);
          
          course.enrolledStudents[studentIndex].lessonsCompleted = newCount;
          
          // Save the course
          console.log('Saving course...');
          await course.save();
          console.log('Course saved successfully');
          
          console.log(`✅ Updated lessonsCompleted for user ${userId} (MongoDB ID: ${mongoUserId}) in course ${courseId}: ${currentCount} -> ${newCount}`);
        } else {
          console.log(`❌ MongoDB User ${mongoUserId} (Clerk ID: ${userId}) not found in enrolledStudents for course ${courseId}`);
          console.log('Available user IDs in course:', course.enrolledStudents.map((s: any) => s.userId));
        }
      } else {
        console.log('❌ No enrolledStudents array found in course');
      }
    }
    console.log('=== End updateCourseProgress Debug ===');
  } catch (error) {
    console.error('❌ Error updating course progress:', error);
    // Don't throw here - we don't want to fail the main operation if this fails
  }
}

// GET - Fetch lesson progress for a course
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get the current user's email from Clerk
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    
    // Fetch all lesson progress for the user in this course
    const progressRecords = await LessonProgress.find({
      userId,
      courseId
    });
    
    // Convert to a map for easy lookup
    const progressMap = new Map();
    progressRecords.forEach(record => {
      progressMap.set(record.lessonId, {
        status: record.status,
        completedAt: record.completedAt,
        lastAccessedAt: record.lastAccessedAt
      });
    });
    
    return NextResponse.json({
      courseId,
      userId,
      progress: Object.fromEntries(progressMap)
    });
    
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson progress' }, { status: 500 });
  }
}

// POST/PUT - Update lesson progress
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get the current user's email from Clerk
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const body = await request.json();
    const { courseId, chapterId, lessonId, status } = body;
    
    if (!courseId || !chapterId || !lessonId || !status) {
      return NextResponse.json({ 
        error: 'Course ID, Chapter ID, Lesson ID, and status are required' 
      }, { status: 400 });
    }
    
    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be: not_started, in_progress, or completed' 
      }, { status: 400 });
    }
    
    // Get the previous status to determine if we need to update lesson count
    const existingProgress = await LessonProgress.findOne({
      userId,
      lessonId
    });
    
    const previousStatus = existingProgress?.status || 'not_started';
    
    // Update or create lesson progress
    const progressRecord = await LessonProgress.findOneAndUpdate(
      {
        userId,
        lessonId
      },
      {
        userId,
        userEmail,
        courseId,
        chapterId,
        lessonId,
        status,
        lastAccessedAt: new Date(),
        ...(status === 'completed' ? { completedAt: new Date() } : {})
      },
      {
        upsert: true,
        new: true
      }
    );
    
    // Update lessonsCompleted count in course's enrolledStudents
    await updateCourseProgress(userId, courseId, previousStatus, status);
    
    return NextResponse.json({
      success: true,
      progress: {
        lessonId: progressRecord.lessonId,
        status: progressRecord.status,
        completedAt: progressRecord.completedAt,
        lastAccessedAt: progressRecord.lastAccessedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    return NextResponse.json({ error: 'Failed to update lesson progress' }, { status: 500 });
  }
} 