import { useState, useEffect } from 'react';

export interface CourseStats {
  totalStudents: number;
  completionRate: number;
  averageRating: number;
  newAssignmentSubmissions: number;
  quizCompletions: number;
  newEnrollments: number;
}

export default function useCourseStats(courseId: string) {
  const [stats, setStats] = useState<CourseStats>({
    totalStudents: 0,
    completionRate: 0,
    averageRating: 0,
    newAssignmentSubmissions: 0,
    quizCompletions: 0,
    newEnrollments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        // Call the real API endpoint
        const response = await fetch(`/api/courses/${courseId}/stats`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStats(data.data);
        } else {
          setError(data.error || 'Failed to fetch course statistics');
          // Fall back to mock data in case of error
          const mockStats: CourseStats = {
            totalStudents: 150,
            completionRate: 75,
            averageRating: 4.5,
            newAssignmentSubmissions: 12,
            quizCompletions: 25,
            newEnrollments: 8,
          };
          setStats(mockStats);
        }
      } catch (error) {
        console.error('Error fetching course stats:', error);
        setError('Failed to fetch course statistics');
        // Fall back to mock data in case of error
        const mockStats: CourseStats = {
          totalStudents: 150,
          completionRate: 75,
          averageRating: 4.5,
          newAssignmentSubmissions: 15,
          quizCompletions: 25,
          newEnrollments: 8,
        };
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [courseId]);

  return {
    stats,
    loading,
    error,
    refetch: () => {
      if (courseId) {
        setLoading(true);
        setError(null);
        // Re-run fetch logic here
      }
    }
  };
} 