export interface Course {
  id: string;
  title: string;
  code: string;
  students: number;
  progress: number;
  nextClass?: {
    time: string;
    room: string;
  };
}

export interface Class {
  id: string;
  courseId: string;
  title: string;
  time: string;
  room: string;
  students: number;
}

export interface Test {
  id: string;
  courseId: string;
  title: string;
  date: Date;
  duration: string;
  totalMarks: number;
  submissions: number;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: Date;
  submissions: number;
  totalStudents: number;
}

export interface Recording {
  id: string;
  title: string;
  date: Date;
  duration: string;
  views: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'class' | 'assignment' | 'test';
  time?: string;
  room?: string;
}

export interface LiveClass {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: string;
  room: string;
  status: 'scheduled' | 'live' | 'ended';
  participants: number;
  maxParticipants: number;
  recordingUrl?: string;
} 