import React, { useState, useRef } from 'react';
import { 
  FiPlus, FiVideo, FiLink, FiTrash2, FiEdit2, FiImage, FiFile, FiUpload 
} from 'react-icons/fi';
import { ContentType, LessonContent } from './types';
import UploadModal from './UploadModal';

interface ContentFormProps {
  lessonContents: LessonContent[];
  onAddContent: (content: Omit<LessonContent, 'id' | 'order'>) => void;
  onEditContent: (index: number, content: Omit<LessonContent, 'id' | 'order'>) => void;
  onDeleteContent: (index: number) => void;
}

export default function ContentForm({ 
  lessonContents, 
  onAddContent, 
  onEditContent, 
  onDeleteContent 
}: ContentFormProps) {
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null);
  const [currentContentType, setCurrentContentType] = useState<ContentType>('video');
  const [currentContentTitle, setCurrentContentTitle] = useState('');
  const [currentContentUrl, setCurrentContentUrl] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddEditContent = () => {
    if (!currentContentTitle.trim() || !currentContentUrl.trim()) return;
    
    const contentData = {
      title: currentContentTitle,
      url: currentContentUrl,
      type: currentContentType,
    };
    
    if (editingContentIndex !== null) {
      onEditContent(editingContentIndex, contentData);
      setEditingContentIndex(null);
    } else {
      onAddContent(contentData);
    }
    
    resetContentForm();
  };
  
  const resetContentForm = () => {
    setCurrentContentTitle('');
    setCurrentContentUrl('');
    setIsAddingContent(false);
  };
  
  const handleContentEdit = (index: number) => {
    const content = lessonContents[index];
    setCurrentContentType(content.type);
    setCurrentContentTitle(content.title);
    setCurrentContentUrl(content.url);
    setEditingContentIndex(index);
    setIsAddingContent(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  };
  
  const handleUploadSuccess = (url: string) => {
    setCurrentContentUrl(url);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        {!isAddingContent && (
          <button
            type="button"
            onClick={() => {
              setIsAddingContent(true);
              setTimeout(() => titleInputRef.current?.focus(), 100);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm cursor-pointer"
          >
            <FiPlus size={16} />
            <span>Add Content</span>
          </button>
        )}
      </div>
      
      {/* Content list */}
      {lessonContents.length > 0 && !isAddingContent && (
        <div className="space-y-2">
          {lessonContents.map((content, index) => (
            <div key={content.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                {content.type === 'video' && <FiVideo className="text-blue-500 mr-2" size={18} />}
                {content.type === 'image' && <FiImage className="text-green-500 mr-2" size={18} />}
                {content.type === 'pdf' && <FiFile className="text-red-500 mr-2" size={18} />}
                {content.type === 'link' && <FiLink className="text-purple-500 mr-2" size={18} />}
                <div>
                  <h4 className="font-medium text-gray-900">{content.title}</h4>
                  <p className="text-sm text-gray-500 truncate max-w-xs">{content.url}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleContentEdit(index)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteContent(index)}
                  className="text-red-600 hover:text-red-800 cursor-pointer"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add/Edit content form */}
      {isAddingContent && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          {/* Content Type Selector */}
          <div className="flex border-b border-gray-200 mb-3">
            <button
              type="button"
              onClick={() => setCurrentContentType('video')}
              className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                currentContentType === 'video' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiVideo className="mr-2" />
              Video
            </button>
            <button
              type="button"
              onClick={() => setCurrentContentType('image')}
              className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                currentContentType === 'image' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiImage className="mr-2" />
              Image
            </button>
            <button
              type="button"
              onClick={() => setCurrentContentType('pdf')}
              className={`px-3 py-2 text-sm font-medium flex items-center mr-4 ${
                currentContentType === 'pdf' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiFile className="mr-2" />
              PDF
            </button>
            <button
              type="button"
              onClick={() => setCurrentContentType('link')}
              className={`px-3 py-2 text-sm font-medium flex items-center ${
                currentContentType === 'link' 
                  ? 'text-blue-600 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiLink className="mr-2" />
              Link
            </button>
          </div>

          <div>
            <label htmlFor="content-title" className="block text-sm font-medium text-gray-700 mb-1">
              Content Title *
            </label>
            <input
              ref={titleInputRef}
              id="content-title"
              type="text"
              value={currentContentTitle}
              onChange={(e) => setCurrentContentTitle(e.target.value)}
              placeholder="Enter content title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          <div>
            <label htmlFor="content-url" className="block text-sm font-medium text-gray-700 mb-1">
              {currentContentType === 'link' ? 'URL *' : 'Content URL *'}
            </label>
            <div className="relative">
              <input
                id="content-url"
                type="text"
                value={currentContentUrl}
                onChange={(e) => setCurrentContentUrl(e.target.value)}
                placeholder={
                  currentContentType === 'video' ? 'https://example.com/video' :
                  currentContentType === 'image' ? 'https://example.com/image.jpg' :
                  currentContentType === 'pdf' ? 'https://example.com/document.pdf' :
                  'https://example.com'
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 pr-12"
              />
              {currentContentType !== 'link' && (
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-500 rounded cursor-pointer transition-colors"
                  title={`Upload ${currentContentType}`}
                >
                  <FiUpload size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetContentForm}
              className="px-3 py-1 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddEditContent}
              disabled={!currentContentTitle.trim() || !currentContentUrl.trim()}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm cursor-pointer"
            >
              {editingContentIndex !== null ? 'Update Content' : 'Add Content'}
            </button>
          </div>
        </div>
      )}
      
      {lessonContents.length === 0 && !isAddingContent && (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">No content added yet. Click "Add Content" to get started.</p>
        </div>
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          contentType={currentContentType}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
} 