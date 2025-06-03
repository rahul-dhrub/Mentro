import { useState, useEffect } from 'react';
import { LessonStatus } from '@/components/ui/LessonCompletionDropdown';

interface LessonProgressData {
  status: LessonStatus;
  completedAt?: string;
  lastAccessedAt: string;
}

interface UseLessonProgressReturn {
  progress: Map<string, LessonProgressData>;
  updateLessonProgress: (lessonId: string, chapterId: string, status: LessonStatus) => Promise<void>;
  getLessonStatus: (lessonId: string) => LessonStatus;
  loading: boolean;
  error: string | null;
}

export const useLessonProgress = (courseId: string): UseLessonProgressReturn => {
  const [progress, setProgress] = useState<Map<string, LessonProgressData>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lesson progress for the course
  useEffect(() => {
    if (!courseId) return;

    const fetchProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/lesson-progress?courseId=${courseId}`);
        
        if (response.ok) {
          const data = await response.json();
          const progressMap = new Map();
          
          // Convert the progress object to a Map
          Object.entries(data.progress).forEach(([lessonId, progressData]) => {
            progressMap.set(lessonId, progressData as LessonProgressData);
          });
          
          setProgress(progressMap);
        } else if (response.status === 401) {
          setError('Authentication required');
        } else {
          setError('Failed to fetch lesson progress');
        }
      } catch (err) {
        setError('An error occurred while fetching progress');
        console.error('Error fetching lesson progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId]);

  // Update lesson progress
  const updateLessonProgress = async (lessonId: string, chapterId: string, status: LessonStatus) => {
    console.log('updateLessonProgress called:', { lessonId, chapterId, status, courseId });
    try {
      setError(null);
      
      const requestBody = {
        courseId,
        chapterId,
        lessonId,
        status,
      };
      console.log('Sending request:', requestBody);
      
      const response = await fetch('/api/lesson-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        // Update local state
        setProgress(prev => {
          const newProgress = new Map(prev);
          newProgress.set(lessonId, {
            status: data.progress.status,
            completedAt: data.progress.completedAt,
            lastAccessedAt: data.progress.lastAccessedAt,
          });
          console.log('Updated progress map:', newProgress);
          return newProgress;
        });
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setError(errorData.error || 'Failed to update lesson progress');
        throw new Error(errorData.error || 'Failed to update lesson progress');
      }
    } catch (err) {
      console.error('updateLessonProgress error:', err);
      setError('An error occurred while updating progress');
      throw err;
    }
  };

  // Get lesson status (with default)
  const getLessonStatus = (lessonId: string): LessonStatus => {
    const lessonProgress = progress.get(lessonId);
    return lessonProgress?.status || 'not_started';
  };

  return {
    progress,
    updateLessonProgress,
    getLessonStatus,
    loading,
    error,
  };
}; 