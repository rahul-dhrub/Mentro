import { Course } from '@/app/courses/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CourseFilters {
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  isPublished?: boolean;
  search?: string;
  limit?: number;
  page?: number;
}

export const coursesAPI = {
  // Get all courses with optional filters
  async getAll(filters?: CourseFilters): Promise<ApiResponse<Course[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append('category', filters.category);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.isPublished !== undefined) params.append('isPublished', filters.isPublished.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      
      const query = params.toString() ? `?${params.toString()}` : '';
      
      const response = await fetch(`${BASE_URL}/api/courses${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch courses',
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        error: 'Network error while fetching courses',
      };
    }
  },

  // Get course by ID
  async getById(id: string): Promise<ApiResponse<Course>> {
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch course',
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      return {
        success: false,
        error: 'Network error while fetching course',
      };
    }
  },

  // Create new course
  async create(courseData: Partial<Course> & { code: string }): Promise<ApiResponse<Course>> {
    try {
      const response = await fetch(`${BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to create course',
        };
      }
      
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      return {
        success: false,
        error: 'Network error while creating course',
      };
    }
  },

  // Get categories with course counts
  async getCategories(): Promise<ApiResponse<Array<{ name: string; count: number; icon: string }>>> {
    try {
      const response = await fetch(`${BASE_URL}/api/courses/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // If the endpoint doesn't exist yet, return default categories
        return {
          success: true,
          data: [
            { name: 'Development', count: 0, icon: '💻' },
            { name: 'Business', count: 0, icon: '📊' },
            { name: 'Design', count: 0, icon: '🎨' },
            { name: 'Marketing', count: 0, icon: '📈' },
            { name: 'Music', count: 0, icon: '🎵' }
          ]
        };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: 'Failed to fetch categories',
      };
    }
  }
}; 