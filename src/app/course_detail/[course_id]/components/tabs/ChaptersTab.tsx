import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { Chapter } from '../../types';
import ChapterItem from '../ChapterItem';

interface ChaptersTabProps {
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

export default function ChaptersTab({
  chapters,
  expandedChapters,
  onAddChapter,
  onToggleChapter,
  onEditChapter,
  onDeleteChapter,
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}: ChaptersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
        <button
          onClick={onAddChapter}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus size={20} />
          <span>Add Chapter</span>
        </button>
      </div>
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            isExpanded={expandedChapters.has(chapter.id)}
            onToggle={() => onToggleChapter(chapter.id)}
            onEdit={() => onEditChapter(chapter.id)}
            onDelete={() => onDeleteChapter(chapter.id)}
            onAddLesson={() => onAddLesson(chapter.id)}
            onEditLesson={(lessonId) => onEditLesson(chapter.id, lessonId)}
            onDeleteLesson={(lessonId) => onDeleteLesson(chapter.id, lessonId)}
          />
        ))}
      </div>
    </div>
  );
} 