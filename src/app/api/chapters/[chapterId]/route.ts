import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Chapter, Lesson, ensureModelsRegistered } from '@/lib/models';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { chapterId } = await params;
    const body = await request.json();
    const { title, description, isPublished } = body;
    
    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      { title, description, isPublished },
      { new: true }
    );
    
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { chapterId } = await params;
    
    // First, delete all lessons in this chapter
    await Lesson.deleteMany({ chapterId: chapterId });
    
    // Then delete the chapter
    const chapter = await Chapter.findByIdAndDelete(chapterId);
    
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json({ error: 'Failed to delete chapter' }, { status: 500 });
  }
} 