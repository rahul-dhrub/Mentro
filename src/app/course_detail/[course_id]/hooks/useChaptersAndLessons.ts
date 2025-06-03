'use client';

import { useState, useEffect, useCallback } from 'react';

interface LessonContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'link' | 'pdf' | 'document';
  order: number;
}

interface Lesson {
  _id?: string;
  id: string;
  title: string;
  titleDescription?: string;
  description: string;
  duration: string;
  isPublished: boolean;
  isLive?: boolean;
  lessonContents?: LessonContent[];
  liveScheduleDate?: string;
  liveScheduleTime?: string;
  liveScheduleLink?: string;
  timezone?: string;
  assignments?: any[];
  quizzes?: any[];
}

interface Chapter {
  _id?: string;
  id: string;
  title: string;
  description: string;
  duration: string;
  isPublished: boolean;
  lessons: Lesson[];
  order?: number;
}

export default function useChaptersAndLessons(courseId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chapters?courseId=${courseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapters');
      }
      
      const dbChapters = await response.json();
      
      // Transform the database chapters with populated lessons
      const transformedChapters: Chapter[] = dbChapters.map((chapter: any) => ({
        id: chapter._id,
        _id: chapter._id,
        title: chapter.title,
        description: chapter.description,
        duration: chapter.duration,
        isPublished: chapter.isPublished,
        order: chapter.order,
        lessons: (chapter.lessons || []).map((lesson: any) => ({
          id: lesson._id,
          _id: lesson._id,
          title: lesson.title,
          titleDescription: lesson.titleDescription,
          description: lesson.description,
          duration: lesson.duration,
          isPublished: lesson.isPublished,
          isLive: lesson.isLive,
          lessonContents: lesson.lessonContents || [],
          liveScheduleDate: lesson.liveScheduleDate,
          liveScheduleTime: lesson.liveScheduleTime,
          liveScheduleLink: lesson.liveScheduleLink,
          timezone: lesson.timezone,
          assignments: lesson.assignments || [],
          quizzes: lesson.quizzes || [],
        })),
      }));
      
      setChapters(transformedChapters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const addChapter = async (chapterData: { title: string; description: string }) => {
    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...chapterData,
          courseId,
          order: chapters.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chapter');
      }

      const newChapter = await response.json();
      
      const transformedChapter: Chapter = {
        id: newChapter._id,
        _id: newChapter._id,
        title: newChapter.title,
        description: newChapter.description,
        duration: newChapter.duration,
        isPublished: newChapter.isPublished,
        order: newChapter.order,
        lessons: [],
      };

      setChapters(prev => [...prev, transformedChapter]);
      return transformedChapter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create chapter');
      throw err;
    }
  };

  const deleteChapter = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }

      setChapters(prev => prev.filter(chapter => chapter.id !== chapterId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chapter');
      throw err;
    }
  };

  const editChapter = async (chapterId: string, chapterData: { title: string; description: string; isPublished?: boolean }) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapterData),
      });

      if (!response.ok) {
        throw new Error('Failed to update chapter');
      }

      const updatedChapter = await response.json();
      
      setChapters(prev => 
        prev.map(chapter => 
          chapter.id === chapterId 
            ? { 
                ...chapter, 
                title: updatedChapter.title,
                description: updatedChapter.description,
                isPublished: updatedChapter.isPublished
              }
            : chapter
        )
      );
      
      return updatedChapter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chapter');
      throw err;
    }
  };

  const addLesson = async (chapterId: string, lessonData: any) => {
    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...lessonData,
          chapterId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      const newLesson = await response.json();
      
      const transformedLesson: Lesson = {
        id: newLesson._id,
        _id: newLesson._id,
        title: newLesson.title,
        titleDescription: newLesson.titleDescription,
        description: newLesson.description,
        duration: newLesson.duration,
        isPublished: newLesson.isPublished,
        isLive: newLesson.isLive,
        lessonContents: newLesson.lessonContents || [],
        liveScheduleDate: newLesson.liveScheduleDate,
        liveScheduleTime: newLesson.liveScheduleTime,
        liveScheduleLink: newLesson.liveScheduleLink,
        timezone: newLesson.timezone,
        assignments: newLesson.assignments || [],
        quizzes: newLesson.quizzes || [],
      };

      setChapters(prev => 
        prev.map(chapter => 
          chapter.id === chapterId 
            ? { ...chapter, lessons: [...chapter.lessons, transformedLesson] }
            : chapter
        )
      );
      
      return transformedLesson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson');
      throw err;
    }
  };

  const deleteLesson = async (chapterId: string, lessonId: string) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      setChapters(prev => 
        prev.map(chapter => 
          chapter.id === chapterId 
            ? {
                ...chapter,
                lessons: chapter.lessons.filter(lesson => lesson.id !== lessonId)
              }
            : chapter
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson');
      throw err;
    }
  };

  const editLesson = async (chapterId: string, lessonId: string, lessonData: any) => {
    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }

      const updatedLesson = await response.json();
      
      const transformedLesson: Lesson = {
        id: updatedLesson._id,
        _id: updatedLesson._id,
        title: updatedLesson.title,
        titleDescription: updatedLesson.titleDescription,
        description: updatedLesson.description,
        duration: updatedLesson.duration,
        isPublished: updatedLesson.isPublished,
        isLive: updatedLesson.isLive,
        lessonContents: updatedLesson.lessonContents || [],
        liveScheduleDate: updatedLesson.liveScheduleDate,
        liveScheduleTime: updatedLesson.liveScheduleTime,
        liveScheduleLink: updatedLesson.liveScheduleLink,
        timezone: updatedLesson.timezone,
        assignments: updatedLesson.assignments || [],
        quizzes: updatedLesson.quizzes || [],
      };

      setChapters(prev => 
        prev.map(chapter => 
          chapter.id === chapterId 
            ? {
                ...chapter,
                lessons: chapter.lessons.map(lesson => 
                  lesson.id === lessonId ? transformedLesson : lesson
                )
              }
            : chapter
        )
      );
      
      return transformedLesson;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lesson');
      throw err;
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchChapters();
    }
  }, [courseId, fetchChapters]);

  return {
    chapters,
    loading,
    error,
    addChapter,
    deleteChapter,
    editChapter,
    addLesson,
    deleteLesson,
    editLesson,
    refetchChapters: fetchChapters,
  };
} 