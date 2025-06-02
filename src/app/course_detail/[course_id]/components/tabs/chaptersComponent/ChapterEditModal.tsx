import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Chapter } from '../../../types';

interface ChapterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter | null;
  onEditChapter: (chapterId: string, chapterData: { title: string; description: string; isPublished: boolean }) => Promise<void>;
}

export default function ChapterEditModal({
  isOpen,
  onClose,
  chapter,
  onEditChapter
}: ChapterEditModalProps) {
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDescription, setChapterDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Populate form when chapter changes
  useEffect(() => {
    if (chapter) {
      setChapterTitle(chapter.title);
      setChapterDescription(chapter.description);
      setIsPublished(chapter.isPublished);
    }
  }, [chapter]);

  // Focus on title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleUpdateChapter = async () => {
    if (chapterTitle.trim() && chapter) {
      try {
        setIsUpdating(true);
        await onEditChapter(chapter.id, { 
          title: chapterTitle, 
          description: chapterDescription,
          isPublished 
        });
        onClose();
      } catch (error) {
        console.error('Error updating chapter:', error);
        // You could show an error message to the user here
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Edit Chapter</h3>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
            disabled={isUpdating}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-chapter-title" className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Title
            </label>
            <input
              id="edit-chapter-title"
              ref={titleInputRef}
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              placeholder="Enter chapter title"
              disabled={isUpdating}
            />
          </div>
          
          <div>
            <label htmlFor="edit-chapter-description" className="block text-sm font-medium text-gray-700 mb-2">
              Chapter Description
            </label>
            <textarea
              id="edit-chapter-description"
              value={chapterDescription}
              onChange={(e) => setChapterDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none"
              rows={4}
              placeholder="Enter chapter description (supports markdown)"
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center">
            <input
              id="edit-chapter-published"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isUpdating}
            />
            <label htmlFor="edit-chapter-published" className="ml-2 block text-sm text-gray-700">
              Publish chapter immediately
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateChapter}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isUpdating || !chapterTitle.trim()}
            >
              {isUpdating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isUpdating ? 'Updating...' : 'Update Chapter'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 