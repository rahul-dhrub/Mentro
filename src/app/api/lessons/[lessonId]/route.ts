import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lesson from '@/models/Lesson';
import Chapter from '@/models/Chapter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    await connectDB();
    
    const { lessonId } = await params;
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    
    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    await connectDB();
    
    const { lessonId } = await params;
    const body = await request.json();
    const updateData = { ...body };
    
    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      updateData,
      { new: true }
    );
    
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    
    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    await connectDB();
    
    const { lessonId } = await params;
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    
    // Remove lesson from chapter's lessons array
    await Chapter.findByIdAndUpdate(
      lesson.chapterId,
      { $pull: { lessons: lesson._id } }
    );
    
    // Delete the lesson
    await Lesson.findByIdAndDelete(lessonId);
    
    return NextResponse.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
  }
} 