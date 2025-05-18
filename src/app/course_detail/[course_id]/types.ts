export interface Chapter {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  isPublished: boolean;
  lessons: Lesson[];
}

export interface VideoContent {
  id: string;
  title: string;
  description?: string;
  url: string;
  duration?: string;
  type: 'video' | 'upload';
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPublished: boolean;
  isLive?: boolean;
  videoContents?: VideoContent[];
  liveScheduleDate?: string;
  liveScheduleTime?: string;
  liveScheduleLink?: string;
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
  scheduled?: boolean;
  startDateTime?: string;
  endDateTime?: string;
  contents?: VideoContent[];
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'faculty';
  avatar?: string;
  joinedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  lastActivity: string;
  status: 'active' | 'inactive';
} 