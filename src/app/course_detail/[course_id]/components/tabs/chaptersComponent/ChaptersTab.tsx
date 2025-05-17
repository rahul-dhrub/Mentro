import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { ChaptersTabProps } from './types';
import ChapterItem from '../../ChapterItem';
import LessonModal from './LessonModal';

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
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  
  const handleAddLessonClick = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setShowLessonModal(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
        <button
          onClick={onAddChapter}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
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
            onAddLesson={() => handleAddLessonClick(chapter.id)}
            onEditLesson={(lessonId) => onEditLesson(chapter.id, lessonId)}
            onDeleteLesson={(lessonId) => onDeleteLesson(chapter.id, lessonId)}
          />
        ))}
      </div>
      
      {/* Lesson Modal */}
      <LessonModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        chapterId={currentChapterId}
        onAddLesson={onAddLesson}
      />
    </div>
  );
} 