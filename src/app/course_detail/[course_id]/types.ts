export interface Chapter {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  isPublished: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPublished: boolean;
  assignments?: Assignment[];
  quizzes?: Quiz[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  submissions: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  duration: number;
  totalMarks: number;
  isPublished: boolean;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'faculty';
  avatar?: string;
  joinedAt: string;
} 