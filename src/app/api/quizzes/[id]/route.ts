import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Quiz from '@/models/Quiz';

// GET /api/quizzes/[id] - Get quiz by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    const quiz = await Quiz.findById(id);
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const {
      title,
      description,
      duration,
      questions,
      isPublished,
      scheduled,
      startDateTime,
      endDateTime,
      contents
    } = body;
    
    // Find the quiz first to check ownership
    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the quiz or has admin rights
    if (existingQuiz.createdBy !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to edit this quiz' },
        { status: 403 }
      );
    }
    
    const updateData: any = {};
    
    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { success: false, error: 'Quiz title cannot be empty' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }
    
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (duration !== undefined) {
      if (duration < 1) {
        return NextResponse.json(
          { success: false, error: 'Duration must be at least 1 minute' },
          { status: 400 }
        );
      }
      updateData.duration = parseInt(duration);
    }
    
    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one question is required' },
          { status: 400 }
        );
      }
      updateData.questions = questions;
      updateData.totalQuestions = questions.length;
      updateData.totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);
    }
    
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (scheduled !== undefined) updateData.scheduled = Boolean(scheduled);
    
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
      
      updateData.startDateTime = startDate;
      updateData.endDateTime = endDate;
    } else {
      updateData.startDateTime = undefined;
      updateData.endDateTime = undefined;
    }
    
    if (contents !== undefined) updateData.contents = contents || [];
    
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    
    // Handle mongoose validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const validationErrors = Object.values((error as any).errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: `Validation error: ${validationErrors.join(', ')}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update quiz' },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    // Find the quiz first to check ownership
    const existingQuiz = await Quiz.findById(id);
    if (!existingQuiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns the quiz or has admin rights
    if (existingQuiz.createdBy !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this quiz' },
        { status: 403 }
      );
    }
    
    await Quiz.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
} 