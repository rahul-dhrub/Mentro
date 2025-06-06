import { useState, useEffect } from 'react';
import { Course } from '../../types';
import { coursesAPI } from '@/lib/api/courses';

// This hook fetches course data from the database
export function useCourseData(courseId: string): { course: Course | null, isLoading: boolean, error: string | null } {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await coursesAPI.getById(courseId);
        
        if (response.success && response.data) {
          setCourse(response.data);
        } else {
          setError(response.error || 'Course not found');
          setCourse(null);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    } else {
      setError('Invalid course ID');
      setIsLoading(false);
    }
  }, [courseId]);

  return { course, isLoading, error };
} 