import { Chapter } from '../../../types';

// Content types for the lesson content
export type ContentType = 'video' | 'image' | 'link' | 'pdf';

// Lesson content interface
export interface LessonContent {
  id: string;
  title: string;
  url: string;
  type: ContentType;
  order: number;
}

export interface ChaptersTabProps {
  chapters: Chapter[];
  expandedChapters: Set<string>;
  onAddChapter: (chapterData: { title: string; description: string }) => Promise<void>;
  onToggleChapter: (chapterId: string) => void;
  onEditChapter: (chapterId: string, chapterData: { title: string; description: string; isPublished: boolean }) => Promise<void>;
  onDeleteChapter: (chapterId: string) => void;
  onAddLesson: (chapterId: string, lessonData: any) => Promise<void>;
  onEditLesson: (chapterId: string, lessonId: string, lessonData: any) => Promise<void>;
  onDeleteLesson: (chapterId: string, lessonId: string) => void;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  onUploadSuccess: (url: string) => void;
}

export interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string | null;
  onAddLesson: (chapterId: string, lessonData: any) => Promise<void>;
}

export interface LessonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string;
  lessonId: string;
  lesson: any | null;
  onEditLesson: (chapterId: string, lessonId: string, lessonData: any) => Promise<void>;
}

export interface ContentFormProps {
  lessonContents: LessonContent[];
  onAddContent: (content: LessonContent) => void;
  onEditContent: (index: number, content: LessonContent) => void;
  onDeleteContent: (index: number) => void;
} 