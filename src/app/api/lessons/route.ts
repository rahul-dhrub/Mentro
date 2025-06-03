import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Lesson, Chapter, ensureModelsRegistered } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');
    
    if (!chapterId) {
      return NextResponse.json({ error: 'Chapter ID is required' }, { status: 400 });
    }
    
    const lessons = await Lesson.find({ chapterId }).sort({ order: 1 });
    
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure all models are registered
    ensureModelsRegistered();
    
    const body = await request.json();
    const { 
      title, 
      titleDescription,
      description, 
      duration, 
      chapterId, 
      isLive,
      lessonContents,
      liveScheduleDate,
      liveScheduleTime,
      liveScheduleLink,
      timezone,
      utcDateTime
    } = body;
    
    if (!title || !chapterId) {
      return NextResponse.json({ error: 'Title and chapter ID are required' }, { status: 400 });
    }
    
    // Create lesson data object
    const lessonData = {
      title,
      titleDescription: titleDescription || '',
      description: description || '',
      duration: duration || '0 min',
      chapterId,
      isLive: isLive || false,
      lessonContents: lessonContents || [],
      liveScheduleDate,
      liveScheduleTime,
      liveScheduleLink,
      timezone,
      utcDateTime,
      order: 0,
    };
    
    // Create new lesson
    const lesson = new Lesson(lessonData);
    
    try {
      await lesson.save();
    } catch (saveError) {
      console.error('Error saving lesson:', saveError);
      console.error('Validation errors:', lesson.errors);
      throw saveError;
    }
        
    // Add lesson to chapter's lessons array
    await Chapter.findByIdAndUpdate(
      chapterId,
      { $push: { lessons: lesson._id } }
    );
    
    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
  }
} 