import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaHeading } from 'react-icons/fa';
import MDEditor from '@uiw/react-md-editor';
import '../chaptersComponent/markdown-styles.css';
import ContentForm from '../chaptersComponent/ContentForm';
import { ContentType, LessonContent } from '../chaptersComponent/types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAssignment: (assignmentData: any) => void;
  lessonId?: string | null;
}

export default function AssignmentModal({ 
  isOpen, 
  onClose, 
  onAddAssignment,
  lessonId
}: AssignmentModalProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [contents, setContents] = useState<LessonContent[]>([]);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setTotalMarks('');
    setContents([]);
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
    
    setDescription(prev => {
      if (selectedText) {
        // Replace selected text with formatted text
        const selection = window.getSelection();
        const range = selection?.getRangeAt(0);
        if (!range || !selection) return prev + newText;
        
        // Get the start and end indices of the selection in the textarea value
        const textarea = document.getElementById('assignment-description') as HTMLTextAreaElement;
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
  
  const handleAddContent = (content: Omit<LessonContent, 'id' | 'order'>) => {
    const newContent: LessonContent = {
      id: Date.now().toString(),
      ...content,
      order: contents.length,
    };
    setContents(prev => [...prev, newContent]);
  };
  
  const handleEditContent = (index: number, content: Omit<LessonContent, 'id' | 'order'>) => {
    setContents(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ...content,
      };
      return updated;
    });
  };
  
  const handleDeleteContent = (index: number) => {
    setContents(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      // Update order of remaining contents
      return updated.map((content, idx) => ({ ...content, order: idx }));
    });
  };
  
  const handleSaveAssignment = () => {
    if (!title.trim()) return;
    
    // Create assignment object
    const assignmentData = {
      id: Date.now().toString(),
      title,
      description,
      dueDate,
      totalMarks: parseInt(totalMarks) || 0,
      submissions: 0,
      lessonId,
      contents // Include the media contents
    };
    
    console.log('Saving assignment:', assignmentData);
    
    // Call the parent handler with the new assignment data
    onAddAssignment(assignmentData);
    
    // Close modal and reset form
    onClose();
    resetForm();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Add New Assignment</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="assignment-title" className="block text-sm font-medium text-gray-700 mb-1">
              Assignment Title *
            </label>
            <input
              ref={titleInputRef}
              id="assignment-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          <div>
            <label htmlFor="assignment-description" className="block text-sm font-medium text-gray-700 mb-1">
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
                id="assignment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter assignment description (Markdown supported)"
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono"
              />
              {description && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="border border-gray-400 rounded-lg p-4 bg-white shadow-inner prose prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-black prose-em:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-a:text-blue-600 max-w-none">
                    <MDEditor.Markdown 
                      source={description} 
                      style={{ backgroundColor: 'white' }}
                      className="white-markdown-preview"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="due-date" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            
            <div>
              <label htmlFor="total-marks" className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks *
              </label>
              <input
                id="total-marks"
                type="number"
                min="0"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
          </div>
          
          {/* Content Upload Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <ContentForm
              lessonContents={contents}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
            />
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAssignment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              disabled={!title.trim() || !dueDate || !totalMarks}
            >
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 