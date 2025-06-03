const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'An error occurred');
    }

    return result;
  } catch (error) {
    console.error('API call error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Assignment API calls
export const assignmentAPI = {
  // Get all assignments
  getAll: (courseId?: string, lessonId?: string) => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (lessonId) params.append('lessonId', lessonId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<any[]>(`/api/assignments${query}`);
  },

  // Get assignment by ID
  getById: (id: string) => apiCall<any>(`/api/assignments/${id}`),

  // Create new assignment
  create: (data: any) =>
    apiCall<any>(`/api/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update assignment
  update: (id: string, data: any) =>
    apiCall<any>(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete assignment
  delete: (id: string) =>
    apiCall<{ message: string }>(`/api/assignments/${id}`, {
      method: 'DELETE',
    }),
};

// Quiz API calls
export const quizAPI = {
  // Get all quizzes
  getAll: (courseId?: string, lessonId?: string) => {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    if (lessonId) params.append('lessonId', lessonId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall<any[]>(`/api/quizzes${query}`);
  },

  // Get quiz by ID
  getById: (id: string) => apiCall<any>(`/api/quizzes/${id}`),

  // Create new quiz
  create: (data: any) =>
    apiCall<any>(`/api/quizzes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update quiz
  update: (id: string, data: any) =>
    apiCall<any>(`/api/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete quiz
  delete: (id: string) =>
    apiCall<{ message: string }>(`/api/quizzes/${id}`, {
      method: 'DELETE',
    }),
}; 