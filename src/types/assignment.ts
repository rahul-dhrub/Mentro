export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Submission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  feedback?: string;
  notes?: string;
  attachments: Attachment[];
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  content: string;
  dueDate: string;
  totalMarks: number;
  submissions: number;
  attachments: Attachment[];
  courseId?: {
    _id: string;
    title: string;
  };
  courseName?: string;
  isPublished: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
} 