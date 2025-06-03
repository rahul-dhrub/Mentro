import { Faculty } from '@/app/course_detail/[course_id]/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AddFacultyData {
  name: string;
  email: string;
  role?: 'owner' | 'faculty';
}

export const facultyAPI = {
  // Get all faculty for a course
  async getFaculty(courseId: string): Promise<ApiResponse<Faculty[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}/faculty`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to fetch faculty',
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching faculty:', error);
      return {
        success: false,
        error: 'Network error while fetching faculty',
      };
    }
  },

  // Add a faculty member to a course
  async addFaculty(courseId: string, facultyData: AddFacultyData): Promise<ApiResponse<Faculty[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}/faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facultyData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to add faculty member',
        };
      }

      return data;
    } catch (error) {
      console.error('Error adding faculty:', error);
      return {
        success: false,
        error: 'Network error while adding faculty member',
      };
    }
  },

  // Remove a faculty member from a course
  async removeFaculty(courseId: string, facultyId: string): Promise<ApiResponse<Faculty[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}/faculty/${facultyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to remove faculty member',
        };
      }

      return data;
    } catch (error) {
      console.error('Error removing faculty:', error);
      return {
        success: false,
        error: 'Network error while removing faculty member',
      };
    }
  },

  // Transfer ownership to another faculty member
  async transferOwnership(courseId: string, newOwnerEmail: string): Promise<ApiResponse<Faculty[]>> {
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${courseId}/transfer-ownership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newOwnerEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to transfer ownership',
        };
      }

      return data;
    } catch (error) {
      console.error('Error transferring ownership:', error);
      return {
        success: false,
        error: 'Network error while transferring ownership',
      };
    }
  },
};

export default facultyAPI; 