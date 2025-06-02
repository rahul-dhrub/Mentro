export interface Chapter {
  id: string;
  _id?: string;
  title: string;
  description: string;
  duration: string;
  isPublished: boolean;
  lessons: Lesson[];
  order?: number;
}

export interface LessonContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'link' | 'pdf' | 'document';
  order: number;
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
  _id?: string;
  title: string;
  description: string;
  duration: string;
  isPublished: boolean;
  isLive?: boolean;
  lessonContents?: LessonContent[];
  videoContents?: VideoContent[];
  liveScheduleDate?: string;
  liveScheduleTime?: string;
  liveScheduleLink?: string;
  timezone?: string;
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