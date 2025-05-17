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
  onAddChapter: () => void;
  onToggleChapter: (chapterId: string) => void;
  onEditChapter: (chapterId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddLesson: (chapterId: string) => void;
  onEditLesson: (chapterId: string, lessonId: string) => void;
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
  onSave: (chapterId: string, lessonData: any) => void;
}

export interface ContentFormProps {
  lessonContents: LessonContent[];
  onAddContent: (content: LessonContent) => void;
  onEditContent: (index: number, content: LessonContent) => void;
  onDeleteContent: (index: number) => void;
} 