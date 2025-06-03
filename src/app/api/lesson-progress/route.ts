import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import LessonProgress from '@/models/LessonProgress';
import { ensureModelsRegistered } from '@/lib/models';

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
        lastAccessedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );
    
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