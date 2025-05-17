import { useState, useEffect } from 'react';
import { Course } from '../../types';

// This is a custom hook that would normally fetch course data from an API
// For now, it returns mock data based on the course ID
export function useCourseData(courseId: string): { course: Course | null, isLoading: boolean, error: string | null } {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchCourse = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock course data
        const mockCourse: Course = {
          id: courseId,
          title: 'Complete Web Development Bootcamp',
          description: 'Learn web development from scratch. Master HTML, CSS, JavaScript, React, Node.js, and more.',
          instructor: {
            name: 'John Doe',
            image: 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
            rating: 4.8,
            reviews: 1250
          },
          rating: 4.7,
          reviews: 2500,
          students: 15000,
          price: 49.99,
          originalPrice: 199.99,
          thumbnail: 'https://wpassets.brainstation.io/app/uploads/2021/10/24135334/Web-Dev.jpg',
          category: 'Development',
          level: 'Beginner',
          duration: '45 hours',
          lastUpdated: new Date('2024-03-15'),
          features: ['Lifetime access', 'Certificate of completion', 'Downloadable resources'],
          requirements: ['Basic computer knowledge', 'No programming experience needed'],
          whatYouWillLearn: [
            'Build responsive websites',
            'Create web applications',
            'Deploy to production'
          ],
          curriculum: [
            {
              title: 'HTML & CSS Fundamentals',
              lectures: 25,
              duration: '10 hours',
              sections: [
                {
                  title: 'Introduction to HTML',
                  lectures: [
                    {
                      title: 'Welcome to the Course',
                      duration: '5:00',
                      type: 'video',
                      preview: true
                    },
                    {
                      title: 'Setting Up Your Development Environment',
                      duration: '10:00',
                      type: 'video'
                    },
                    {
                      title: 'HTML Document Structure',
                      duration: '15:00',
                      type: 'video'
                    },
                    {
                      title: 'HTML Elements and Tags',
                      duration: '20:00',
                      type: 'video'
                    },
                    {
                      title: 'HTML Quiz 1',
                      duration: '15:00',
                      type: 'quiz'
                    }
                  ]
                },
                {
                  title: 'CSS Basics',
                  lectures: [
                    {
                      title: 'Introduction to CSS',
                      duration: '10:00',
                      type: 'video'
                    },
                    {
                      title: 'CSS Selectors and Properties',
                      duration: '20:00',
                      type: 'video'
                    },
                    {
                      title: 'CSS Box Model',
                      duration: '15:00',
                      type: 'video'
                    },
                    {
                      title: 'CSS Layout Techniques',
                      duration: '25:00',
                      type: 'video'
                    },
                    {
                      title: 'CSS Assignment 1',
                      duration: '30:00',
                      type: 'assignment'
                    }
                  ]
                }
              ]
            },
            {
              title: 'JavaScript Mastery',
              lectures: 30,
              duration: '15 hours',
              sections: [
                {
                  title: 'JavaScript Fundamentals',
                  lectures: [
                    {
                      title: 'Introduction to JavaScript',
                      duration: '10:00',
                      type: 'video',
                      preview: true
                    },
                    {
                      title: 'Variables and Data Types',
                      duration: '15:00',
                      type: 'video'
                    },
                    {
                      title: 'Control Flow and Functions',
                      duration: '20:00',
                      type: 'video'
                    },
                    {
                      title: 'JavaScript Reading Materials',
                      duration: '30:00',
                      type: 'reading'
                    }
                  ]
                }
              ]
            }
          ]
        };
        
        setCourse(mockCourse);
        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return { course, isLoading, error };
} 