import React, { useState, useRef } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import { ChaptersTabProps } from './types';
import ChapterItem from '../../ChapterItem';
import LessonModal from './LessonModal';
import ChapterEditModal from './ChapterEditModal';
import LessonEditModal from './LessonEditModal';

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
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDescription, setChapterDescription] = useState('');
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Edit modal states
  const [showChapterEditModal, setShowChapterEditModal] = useState(false);
  const [chapterToEdit, setChapterToEdit] = useState<any>(null);
  const [showLessonEditModal, setShowLessonEditModal] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<{chapterId: string, lessonId: string, lesson: any} | null>(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<{id: string, title: string} | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Lesson delete confirmation modal states
  const [showLessonDeleteModal, setShowLessonDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<{chapterId: string, lessonId: string, title: string} | null>(null);
  const [lessonDeleteConfirmation, setLessonDeleteConfirmation] = useState('');
  
  const handleAddLessonClick = (chapterId: string) => {
    setCurrentChapterId(chapterId);
    setShowLessonModal(true);
  };
  
  const handleEditChapterClick = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setChapterToEdit(chapter);
      setShowChapterEditModal(true);
    }
  };

  const handleEditLessonClick = (chapterId: string, lessonId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setLessonToEdit({ chapterId, lessonId, lesson });
        setShowLessonEditModal(true);
      }
    }
  };
  
  const handleAddChapter = async () => {
    if (chapterTitle.trim()) {
      try {
        setIsCreatingChapter(true);
        await onAddChapter({ 
          title: chapterTitle, 
          description: chapterDescription 
        });
        setChapterTitle('');
        setChapterDescription('');
        setShowChapterModal(false);
      } catch (error) {
        console.error('Error creating chapter:', error);
        // You could show an error message to the user here
      } finally {
        setIsCreatingChapter(false);
      }
    }
  };
  
  const handleDeleteClick = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setChapterToDelete({ id: chapter.id, title: chapter.title });
      setDeleteConfirmation('');
      setShowDeleteModal(true);
    }
  };
  
  const handleConfirmDelete = () => {
    if (chapterToDelete && deleteConfirmation === chapterToDelete.title) {
      onDeleteChapter(chapterToDelete.id);
      setShowDeleteModal(false);
      setChapterToDelete(null);
      setDeleteConfirmation('');
    }
  };
  
  const handleLessonDeleteClick = (chapterId: string, lessonId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setLessonToDelete({ 
          chapterId: chapter.id, 
          lessonId: lesson.id, 
          title: lesson.title 
        });
        setLessonDeleteConfirmation('');
        setShowLessonDeleteModal(true);
      }
    }
  };
  
  const handleConfirmLessonDelete = () => {
    if (lessonToDelete && lessonDeleteConfirmation === lessonToDelete.title) {
      onDeleteLesson(lessonToDelete.chapterId, lessonToDelete.lessonId);
      setShowLessonDeleteModal(false);
      setLessonToDelete(null);
      setLessonDeleteConfirmation('');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
        <button
          onClick={() => {
            setShowChapterModal(true);
            setTimeout(() => titleInputRef.current?.focus(), 100);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <FiPlus size={20} />
          <span>Add Chapter</span>
        </button>
      </div>
      
      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Chapter</h3>
              <button 
                onClick={() => setShowChapterModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
                disabled={isCreatingChapter}
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Title
                </label>
                <input
                  ref={titleInputRef}
                  id="chapter-title"
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="Introduction to the Course"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  disabled={isCreatingChapter}
                />
              </div>
              <div>
                <label htmlFor="chapter-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Description
                </label>
                <textarea
                  id="chapter-description"
                  value={chapterDescription}
                  onChange={(e) => setChapterDescription(e.target.value)}
                  placeholder="Provide a brief description of this chapter..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                  disabled={isCreatingChapter}
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  disabled={isCreatingChapter}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddChapter}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  disabled={isCreatingChapter || !chapterTitle.trim()}
                >
                  {isCreatingChapter && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{isCreatingChapter ? 'Creating...' : 'Add Chapter'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chapter Delete Confirmation Modal */}
      {showDeleteModal && chapterToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-600">Delete Chapter</h3>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete the chapter 
                  and all associated lessons.
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                To confirm, type <strong className="font-medium">{chapterToDelete.title}</strong> in the field below:
              </p>
              
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                autoFocus
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmation !== chapterToDelete.title}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
                    deleteConfirmation === chapterToDelete.title 
                      ? 'hover:bg-red-700 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Delete Chapter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lesson Delete Confirmation Modal */}
      {showLessonDeleteModal && lessonToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-red-600">Delete Lesson</h3>
              <button 
                onClick={() => setShowLessonDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> This action cannot be undone. This will permanently delete the lesson
                  and all associated content.
                </p>
              </div>
              
              <p className="text-sm text-gray-700">
                To confirm, type <strong className="font-medium">{lessonToDelete.title}</strong> in the field below:
              </p>
              
              <input
                type="text"
                value={lessonDeleteConfirmation}
                onChange={(e) => setLessonDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-700"
                autoFocus
              />
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowLessonDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLessonDelete}
                  disabled={lessonDeleteConfirmation !== lessonToDelete.title}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg ${
                    lessonDeleteConfirmation === lessonToDelete.title 
                      ? 'hover:bg-red-700 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  Delete Lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            isExpanded={expandedChapters.has(chapter.id)}
            onToggle={() => onToggleChapter(chapter.id)}
            onEdit={() => handleEditChapterClick(chapter.id)}
            onDelete={() => handleDeleteClick(chapter.id)}
            onAddLesson={() => handleAddLessonClick(chapter.id)}
            onEditLesson={(lessonId) => handleEditLessonClick(chapter.id, lessonId)}
            onDeleteLesson={(lessonId) => handleLessonDeleteClick(chapter.id, lessonId)}
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
      
      {/* Chapter Edit Modal */}
      {showChapterEditModal && chapterToEdit && (
        <ChapterEditModal
          isOpen={showChapterEditModal}
          onClose={() => setShowChapterEditModal(false)}
          chapter={chapterToEdit}
          onEditChapter={async (chapterId, chapterData) => {
            await onEditChapter(chapterId, chapterData);
            setShowChapterEditModal(false);
            setChapterToEdit(null);
          }}
        />
      )}
      
      {/* Lesson Edit Modal */}
      {showLessonEditModal && lessonToEdit && (
        <LessonEditModal
          isOpen={showLessonEditModal}
          onClose={() => setShowLessonEditModal(false)}
          chapterId={lessonToEdit.chapterId}
          lessonId={lessonToEdit.lessonId}
          lesson={lessonToEdit.lesson}
          onEditLesson={async (chapterId, lessonId, lessonData) => {
            await onEditLesson(chapterId, lessonId, lessonData);
            setShowLessonEditModal(false);
            setLessonToEdit(null);
          }}
        />
      )}
    </div>
  );
} 