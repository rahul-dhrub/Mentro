import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiVideo, FiCalendar } from 'react-icons/fi';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaHeading } from 'react-icons/fa';
import { ContentType, LessonContent } from './types';
import ContentForm from './ContentForm';
import LiveScheduleForm from './LiveScheduleForm';
import MDEditor from '@uiw/react-md-editor';
import './markdown-styles.css';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string | null;
  onAddLesson: (chapterId: string) => void;
}

export default function LessonModal({ 
  isOpen, 
  onClose, 
  chapterId, 
  onAddLesson 
}: LessonModalProps) {
  const [activeModalTab, setActiveModalTab] = useState('recorded');
  
  // Form states
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonContents, setLessonContents] = useState<LessonContent[]>([]);
  const [liveScheduleDate, setLiveScheduleDate] = useState('');
  const [liveScheduleTime, setLiveScheduleTime] = useState('');
  const [liveScheduleLink, setLiveScheduleLink] = useState('');
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  const resetForm = () => {
    setLessonTitle('');
    setLessonDescription('');
    setLessonDuration('');
    setLessonContents([]);
    setActiveModalTab('recorded');
    setLiveScheduleDate('');
    setLiveScheduleTime('');
    setLiveScheduleLink('');
  };
  
  // Text formatting functions
  const insertTextFormat = (format: string) => {
    let selectedText = window.getSelection()?.toString() || '';
    let newText = '';
    
    switch (format) {
      case 'bold':
        newText = selectedText ? `**${selectedText}**` : '**Bold text**';
        break;
      case 'italic':
        newText = selectedText ? `*${selectedText}*` : '*Italic text*';
        break;
      case 'underline':
        newText = selectedText ? `<u>${selectedText}</u>` : '<u>Underlined text</u>';
        break;
      case 'heading':
        newText = selectedText ? `## ${selectedText}` : '## Heading';
        break;
      case 'unorderedList':
        newText = selectedText ? 
          selectedText.split('\n').map(line => `- ${line}`).join('\n') : 
          '- List item\n- Another item';
        break;
      case 'orderedList':
        newText = selectedText ? 
          selectedText.split('\n').map((line, i) => `${i+1}. ${line}`).join('\n') : 
          '1. First item\n2. Second item';
        break;
      case 'link':
        newText = selectedText ? `[${selectedText}](url)` : '[Link text](https://example.com)';
        break;
      default:
        newText = selectedText;
    }
    
    setLessonDescription(prev => {
      if (selectedText) {
        // Replace selected text with formatted text
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        if (!range || !selection) return prev + newText;
        
        // Get the start and end indices of the selection in the textarea value
        const textarea = document.getElementById('lesson-description') as HTMLTextAreaElement;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        // Replace the selected text with the formatted text
        return prev.substring(0, start) + newText + prev.substring(end);
      } else {
        // No selection, just append
        return prev + newText;
      }
    });
  };
  
  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !chapterId) return;
    
    // Create lesson object based on selected tab
    const lessonData = {
      title: lessonTitle,
      description: lessonDescription,
      duration: lessonDuration,
      isLive: activeModalTab === 'live',
      lessonContents, // Include lesson contents for both recorded and live lessons
      ...(activeModalTab === 'live' 
        ? { liveScheduleDate, liveScheduleTime, liveScheduleLink }
        : {})
    };
    
    console.log('Saving lesson:', lessonData);
    
    // Call the parent handler with the new lesson data
    onAddLesson(chapterId);
    
    // Close modal and reset form
    onClose();
    resetForm();
  };
  
  const handleAddContent = (content: Omit<LessonContent, 'id' | 'order'>) => {
    const newContent: LessonContent = {
      id: Date.now().toString(),
      ...content,
      order: lessonContents.length,
    };
    setLessonContents(prev => [...prev, newContent]);
  };
  
  const handleEditContent = (index: number, content: Omit<LessonContent, 'id' | 'order'>) => {
    setLessonContents(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...content,
      };
      return updated;
    });
  };
  
  const handleDeleteContent = (index: number) => {
    setLessonContents(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      // Update order of remaining contents
      return updated.map((content, idx) => ({ ...content, order: idx }));
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Add New Lesson</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveModalTab('recorded')}
              className={`${
                activeModalTab === 'recorded'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer`}
            >
              <FiVideo className="mr-2" />
              Recorded Lesson
            </button>
            <button
              onClick={() => setActiveModalTab('live')}
              className={`${
                activeModalTab === 'live'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer`}
            >
              <FiCalendar className="mr-2" />
              Live Schedule
            </button>
          </nav>
        </div>
        
        {/* Common Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="lesson-title" className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Title *
            </label>
            <input
              ref={titleInputRef}
              id="lesson-title"
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder="Enter lesson title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          <div>
            <label htmlFor="lesson-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="mb-2 flex flex-wrap items-center gap-2 border border-gray-400 rounded-t-lg p-3 bg-gray-200 shadow-md">
              <button 
                type="button" 
                onClick={() => insertTextFormat('bold')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Bold"
              >
                <FaBold size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => insertTextFormat('italic')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Italic"
              >
                <FaItalic size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => insertTextFormat('underline')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Underline"
              >
                <FaUnderline size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => insertTextFormat('heading')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Heading"
              >
                <FaHeading size={16} />
              </button>
              <div className="h-8 w-px bg-gray-500 mx-1"></div>
              <button 
                type="button" 
                onClick={() => insertTextFormat('unorderedList')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Bullet List"
              >
                <FaListUl size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => insertTextFormat('orderedList')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Numbered List"
              >
                <FaListOl size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => insertTextFormat('link')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Link"
              >
                <FaLink size={16} />
              </button>
              <div className="ml-auto text-xs text-gray-700 font-semibold">
                Markdown formatting supported
              </div>
            </div>
            <div className="flex flex-col">
              <textarea
                id="lesson-description"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Enter lesson description (Markdown supported)"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono"
              />
              {lessonDescription && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="border border-gray-400 rounded-lg p-4 bg-white shadow-inner prose prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-black prose-em:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-a:text-blue-600 max-w-none">
                    <MDEditor.Markdown 
                      source={lessonDescription} 
                      style={{ backgroundColor: 'white' }}
                      className="white-markdown-preview"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="lesson-duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              id="lesson-duration"
              type="text"
              value={lessonDuration}
              onChange={(e) => setLessonDuration(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          {/* Tab-specific fields */}
          {activeModalTab === 'recorded' ? (
            <ContentForm
              lessonContents={lessonContents}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
            />
          ) : (
            <>
              <LiveScheduleForm
                scheduleDate={liveScheduleDate}
                scheduleTime={liveScheduleTime}
                scheduleLink={liveScheduleLink}
                onScheduleDateChange={setLiveScheduleDate}
                onScheduleTimeChange={setLiveScheduleTime}
                onScheduleLinkChange={setLiveScheduleLink}
              />
              
              {/* Additional content for live lessons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Content
                  </label>
                </div>
                
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Add supplementary content to enhance your live session
                </p>
                
                <ContentForm
                  lessonContents={lessonContents}
                  onAddContent={handleAddContent}
                  onEditContent={handleEditContent}
                  onDeleteContent={handleDeleteContent}
                />
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveLesson}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              disabled={!lessonTitle.trim()}
            >
              Save Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 