import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
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
    
    // Get user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
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
      contents,
      courseId,
      lessonId
    } = body;
    
    console.log('Received quiz data:', { title, description, duration, contents });
    console.log('Contents array:', contents);
    
    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Quiz title is required' },
        { status: 400 }
      );
    }
    
    if (!duration || duration < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid duration is required (minimum 1 minute)' },
        { status: 400 }
      );
    }
    
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }
    
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one question is required' },
        { status: 400 }
      );
    }
    
    // Validate scheduled quiz times
    if (scheduled) {
      if (!startDateTime || !endDateTime) {
        return NextResponse.json(
          { success: false, error: 'Start and end times are required for scheduled quizzes' },
          { status: 400 }
        );
      }
      
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }
      
      if (startDate >= endDate) {
        return NextResponse.json(
          { success: false, error: 'Start time must be before end time' },
          { status: 400 }
        );
      }
      
      // Check if start time is in the future (optional validation)
      const now = new Date();
      if (startDate <= now) {
        return NextResponse.json(
          { success: false, error: 'Start time must be in the future' },
          { status: 400 }
        );
      }
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.text || !question.text.trim()) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1} text is required` },
          { status: 400 }
        );
      }
      
      if (!question.marks || question.marks < 1) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1} must have at least 1 mark` },
          { status: 400 }
        );
      }
      
      // Validate based on question type
      if (question.type === 'multiple_choice' || question.type === 'multiselect') {
        if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
          return NextResponse.json(
            { success: false, error: `Question ${i + 1} must have at least 2 options` },
            { status: 400 }
          );
        }
        
        const hasCorrectAnswer = question.options.some((opt: any) => opt.isCorrect);
        if (!hasCorrectAnswer) {
          return NextResponse.json(
            { success: false, error: `Question ${i + 1} must have at least one correct answer` },
            { status: 400 }
          );
        }
      } else if (question.type === 'tita') {
        if (!question.correctAnswer || !question.correctAnswer.trim()) {
          return NextResponse.json(
            { success: false, error: `Question ${i + 1} must have a correct answer` },
            { status: 400 }
          );
        }
      }
    }
    
    console.log('Contents variable before Quiz constructor:', contents);
    console.log('Contents || [] result:', contents || []);
    
    const quiz = new Quiz({
      title: title.trim(),
      description: description?.trim() || '',
      duration: parseInt(duration),
      isPublished: Boolean(isPublished),
      scheduled: Boolean(scheduled),
      startDateTime: scheduled ? new Date(startDateTime) : undefined,
      endDateTime: scheduled ? new Date(endDateTime) : undefined,
      questions: questions || [],
      contents: contents || [],
      courseId,
      lessonId: lessonId || undefined,
      createdBy: userId,
    });
    
    // Explicitly set contents to ensure it's not lost
    if (contents && Array.isArray(contents)) {
      quiz.contents = contents;
      console.log('Explicitly set quiz.contents to:', quiz.contents);
    }
    
    console.log('Quiz object after constructor and explicit assignment:', quiz.toObject());
    console.log('Quiz object before save:', quiz);
    console.log('Quiz contents before save:', quiz.contents);
    
    const savedQuiz = await quiz.save();
    
    console.log('Saved quiz:', savedQuiz);
    console.log('Saved quiz contents:', savedQuiz.contents);
    
    return NextResponse.json({
      success: true,
      data: savedQuiz
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    
    // Handle mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create quiz' },
      { status: 500 }
    );
  }
} 