import { useState, useEffect } from 'react';
import { coursesAPI } from '@/lib/api/courses';

export interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: {
    name: string;
    image: string;
  };
  category: string;
  level: string;
  duration: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  students: number;
  isPublished?: boolean;
  features: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  curriculum: any[];
  lastUpdated: string;
}

export default function useCourseData(courseId: string) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await coursesAPI.getById(courseId);
        
        if (response.success && response.data) {
          // Transform the course data to match our interface
          const transformedCourse: CourseData = {
            ...response.data,
            lastUpdated: response.data.lastUpdated instanceof Date 
              ? response.data.lastUpdated.toISOString() 
              : response.data.lastUpdated
          };
          setCourse(transformedCourse);
        } else {
          setError(response.error || 'Failed to fetch course data');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Network error while fetching course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return {
    course,
    loading,
    error,
    refetch: () => {
      if (courseId) {
        setLoading(true);
        setError(null);
        // Re-run fetch
        const fetchCourse = async () => {
          try {
            const response = await coursesAPI.getById(courseId);
            if (response.success && response.data) {
              // Transform the course data to match our interface
              const transformedCourse: CourseData = {
                ...response.data,
                lastUpdated: response.data.lastUpdated instanceof Date 
                  ? response.data.lastUpdated.toISOString() 
                  : response.data.lastUpdated
              };
              setCourse(transformedCourse);
            } else {
              setError(response.error || 'Failed to fetch course data');
            }
          } catch (error) {
            console.error('Error fetching course:', error);
            setError('Network error while fetching course');
          } finally {
            setLoading(false);
          }
        };
        fetchCourse();
      }
    }
  };
} 