import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaHeading } from 'react-icons/fa';
import { TbMath, TbMathFunction } from 'react-icons/tb';
import MDEditor from '@uiw/react-md-editor';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import '../chaptersComponent/markdown-styles.css';
import ContentForm from '../chaptersComponent/ContentForm';
import { ContentType, LessonContent } from '../chaptersComponent/types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAssignment: (assignmentData: any) => void;
  lessonId?: string | null;
  courseId?: string;
}

export default function AssignmentModal({ 
  isOpen, 
  onClose, 
  onAddAssignment,
  lessonId,
  courseId
}: AssignmentModalProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [contents, setContents] = useState<LessonContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  // Effect to render LaTeX in preview
  useEffect(() => {
    if (description && typeof window !== 'undefined') {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        renderLatexInPreview();
      }, 100);
    }
  }, [description]);
  
  const renderLatexInPreview = () => {
    const previewElement = document.querySelector('.assignment-preview');
    if (!previewElement) return;

    // Find all potential math expressions
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      previewElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text);
    }

    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      
      // Handle block math ($$...$$)
      if (text.includes('$$')) {
        const parts = text.split(/(.*?\$\$.*?\$\$.*?)/g);
        if (parts.length > 1) {
          const parent = textNode.parentNode;
          if (parent) {
            parts.forEach((part, index) => {
              if (part.includes('$$')) {
                const mathMatch = part.match(/\$\$(.*?)\$\$/);
                if (mathMatch) {
                  const mathSpan = document.createElement('span');
                  mathSpan.className = 'math-block';
                  try {
                    katex.render(mathMatch[1], mathSpan, {
                      throwOnError: false,
                      displayMode: true
                    });
                    parent.insertBefore(mathSpan, textNode);
                  } catch (e) {
                    mathSpan.textContent = part;
                    parent.insertBefore(mathSpan, textNode);
                  }
                }
              } else if (part.trim()) {
                parent.insertBefore(document.createTextNode(part), textNode);
              }
            });
            parent.removeChild(textNode);
          }
        }
      }
      // Handle inline math ($...$)
      else if (text.includes('$') && !text.includes('$$')) {
        const parts = text.split(/(\$[^$]+\$)/g);
        if (parts.length > 1) {
          const parent = textNode.parentNode;
          if (parent) {
            parts.forEach((part) => {
              if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
                const mathContent = part.slice(1, -1);
                const mathSpan = document.createElement('span');
                mathSpan.className = 'math-inline';
                try {
                  katex.render(mathContent, mathSpan, {
                    throwOnError: false,
                    displayMode: false
                  });
                  parent.insertBefore(mathSpan, textNode);
                } catch (e) {
                  mathSpan.textContent = part;
                  parent.insertBefore(mathSpan, textNode);
                }
              } else if (part.trim()) {
                parent.insertBefore(document.createTextNode(part), textNode);
              }
            });
            parent.removeChild(textNode);
          }
        }
      }
    });
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setTotalMarks('');
    setContents([]);
    setIsLoading(false);
    setError(null);
  };
  
  // Text formatting functions
  const insertTextFormat = (format: string) => {
    const textarea = document.getElementById('assignment-description') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
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
      case 'inlineMath':
        newText = selectedText ? `$${selectedText}$` : '$x = y$';
        break;
      case 'blockMath':
        newText = selectedText ? `$$\n${selectedText}\n$$` : '$$\n\\frac{x^2 + y^2}{z}\n$$';
        break;
      default:
        newText = selectedText;
    }
    
    // Insert the new text at cursor position
    const newValue = description.substring(0, start) + newText + description.substring(end);
    setDescription(newValue);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
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
  
  const handleSaveAssignment = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create assignment object
      const assignmentData = {
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
      await onAddAssignment(assignmentData);
      
      // Close modal and reset form
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assignment');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Add New Assignment</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Custom styles for LaTeX rendering */}
        <style jsx>{`
          .assignment-preview .math-block {
            display: block;
            margin: 1em 0;
            text-align: center;
          }
          
          .assignment-preview .math-inline {
            display: inline;
          }
          
          .assignment-preview .katex {
            font-size: 1.1em;
          }
          
          .assignment-preview .katex-display {
            margin: 1em 0;
          }
        `}</style>
        
        {/* Form Fields */}
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

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
              <div className="h-8 w-px bg-gray-500 mx-1"></div>
              <button 
                type="button" 
                onClick={() => insertTextFormat('inlineMath')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Inline Math ($x$)"
              >
                <TbMath size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => insertTextFormat('blockMath')}
                className="p-2 bg-gray-700 text-white hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm border border-gray-600"
                title="Block Math ($$...$$)"
              >
                <TbMathFunction size={16} />
              </button>
              <div className="ml-auto text-xs text-gray-700 font-semibold">
                Markdown & LaTeX supported
              </div>
            </div>
            <div className="flex flex-col">
              <textarea
                id="assignment-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter assignment description (Markdown & LaTeX supported)&#10;&#10;Examples:&#10;Inline math: $x^2 + y^2 = z^2$&#10;Block math: $$\int_0^1 x^2 dx$$&#10;&#10;More examples:&#10;$$f(x) = \frac{ax^2 + bx + c}{dx + e}$$&#10;$\alpha + \beta = \gamma$"
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono text-sm"
              />
              {description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="assignment-preview border border-gray-400 rounded-lg p-4 bg-white shadow-inner prose prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-black prose-em:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-a:text-blue-600 max-w-none min-h-[200px] overflow-y-auto max-h-[300px]">
                    <MDEditor.Markdown 
                      source={description} 
                      style={{ backgroundColor: 'white' }}
                      className="white-markdown-preview"
                      rehypePlugins={[]}
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
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAssignment}
              disabled={!title.trim() || !dueDate || !totalMarks || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                (!title.trim() || !dueDate || !totalMarks || isLoading)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Assignment</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 