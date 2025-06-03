import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Assignment from '@/models/Assignment';

// GET /api/assignments - Get all assignments or filter by course/lesson
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
    
    const assignments = await Assignment
      .find(filter)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create new assignment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      title,
      description,
      content,
      dueDate,
      totalMarks,
      attachments,
      courseId,
      lessonId,
      isPublished,
      createdBy
    } = body;
    
    // Validation
    if (!title || !dueDate || !totalMarks || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const assignment = new Assignment({
      title,
      description: description || '',
      content: content || '',
      dueDate: new Date(dueDate),
      totalMarks: parseInt(totalMarks),
      attachments: attachments || [],
      courseId,
      lessonId,
      isPublished: isPublished || false,
      createdBy: createdBy || 'system',
    });
    
    const savedAssignment = await assignment.save();
    
    return NextResponse.json({
      success: true,
      data: savedAssignment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
} 