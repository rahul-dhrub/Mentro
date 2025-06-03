import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Chapter, Lesson, ensureModelsRegistered } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    
    // Get chapters with populated lessons
    const chapters = await Chapter.find({ courseId })
      .populate('lessons')
      .sort({ order: 1 });
    
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch chapters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const body = await request.json();
    const { title, description, courseId, order } = body;
    
    if (!title || !courseId) {
      return NextResponse.json({ error: 'Title and course ID are required' }, { status: 400 });
    }
    
    // Create new chapter
    const chapter = new Chapter({
      title,
      description: description || '',
      courseId,
      order: order || 0,
      lessons: [],
    });
    
    await chapter.save();
    
    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
} 