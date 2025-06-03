import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Quiz from '@/models/Quiz';

// GET /api/quizzes - Get all quizzes or filter by course/lesson
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    
    let filter: any = {};
    
    if (courseId) {
      filter.courseId = courseId;
    }
    
    if (lessonId) {
      filter.lessonId = lessonId;
    }
    
    const quizzes = await Quiz
      .find(filter)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quizzes' },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create new quiz
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      title,
      description,
      duration,
      isPublished,
      scheduled,
      startDateTime,
      endDateTime,
      questions,
      courseId,
      lessonId,
      createdBy
    } = body;
    
    // Validation
    if (!title || !duration || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate scheduled quiz times
    if (scheduled && (!startDateTime || !endDateTime)) {
      return NextResponse.json(
        { success: false, error: 'Start and end times are required for scheduled quizzes' },
        { status: 400 }
      );
    }
    
    if (scheduled && new Date(startDateTime) >= new Date(endDateTime)) {
      return NextResponse.json(
        { success: false, error: 'Start time must be before end time' },
        { status: 400 }
      );
    }
    
    const quiz = new Quiz({
      title,
      description: description || '',
      duration: parseInt(duration),
      isPublished: isPublished || false,
      scheduled: scheduled || false,
      startDateTime: scheduled ? new Date(startDateTime) : undefined,
      endDateTime: scheduled ? new Date(endDateTime) : undefined,
      questions: questions || [],
      courseId,
      lessonId,
      createdBy: createdBy || 'system',
    });
    
    const savedQuiz = await quiz.save();
    
    return NextResponse.json({
      success: true,
      data: savedQuiz
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
} 