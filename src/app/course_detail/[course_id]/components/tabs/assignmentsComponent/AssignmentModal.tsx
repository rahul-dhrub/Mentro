import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiVideo, FiImage, FiFile, FiLink, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink as FaLinkIcon, FaHeading } from 'react-icons/fa';
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
  const [content, setContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [contents, setContents] = useState<LessonContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tab and preview states
  const [activeTab, setActiveTab] = useState('details');
  const [showPreview, setShowPreview] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);
  
  // Effect to render LaTeX in preview
  useEffect(() => {
    if (content && typeof window !== 'undefined') {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        renderLatexInPreview();
      }, 100);
    }
  }, [content]);

  const renderLatexInPreview = () => {
    try {
      const previewContainer = document.querySelector('.assignment-preview');
      if (!previewContainer) return;

      // Find all potential math expressions
      const mathInlineElements = previewContainer.querySelectorAll('code');
      const mathBlockElements = previewContainer.querySelectorAll('pre code');

      // Process inline math ($...$)
      mathInlineElements.forEach((element) => {
        const text = element.textContent || '';
        if (text.startsWith('$') && text.endsWith('$') && text.length > 2) {
          const mathContent = text.slice(1, -1);
          try {
            const rendered = katex.renderToString(mathContent, {
              throwOnError: false,
              displayMode: false,
            });
            element.innerHTML = rendered;
            element.classList.add('math-inline');
          } catch (err) {
            console.warn('KaTeX inline render error:', err);
          }
        }
      });

      // Process block math ($$...$$)
      mathBlockElements.forEach((element) => {
        const text = element.textContent || '';
        if (text.startsWith('$$') && text.endsWith('$$') && text.length > 4) {
          const mathContent = text.slice(2, -2);
          try {
            const rendered = katex.renderToString(mathContent, {
              throwOnError: false,
              displayMode: true,
            });
            element.innerHTML = rendered;
            element.classList.add('math-block');
          } catch (err) {
            console.warn('KaTeX block render error:', err);
          }
        }
      });
    } catch (error) {
      console.error('Error rendering LaTeX:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setDueDate('');
    setTotalMarks('');
    setContents([]);
    setError(null);
    setActiveTab('details');
    setShowPreview(false);
  };

  // Text formatting functions
  const insertTextFormat = (format: string) => {
    const textarea = document.getElementById('assignment-content') as HTMLTextAreaElement;
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
    const newValue = content.substring(0, start) + newText + content.substring(end);
    setContent(newValue);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  }
  
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

  // Generate preview content
  const generatePreviewContent = () => {
    // Content now contains the rich text content
    return content || '';
  };

  const renderAttachmentsPreview = () => {
    if (contents.length === 0) return null;
    
    return (
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Materials</h3>
        <div className="space-y-3">
          {contents.map((content, index) => (
            <div
              key={content.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
            >
              <span className="text-sm text-gray-500 font-mono w-8">
                {String(index + 1).padStart(2, '0')}
              </span>
              {renderContentIcon(content.type)}
              <div className="flex-1 min-w-0">
                <h6 className="text-sm font-medium text-gray-900">
                  {content.title}
                </h6>
                <p className="text-xs text-gray-500 truncate">
                  {content.type.toUpperCase()} • {content.url}
                </p>
              </div>
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Open
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContentIcon = (type: ContentType) => {
    switch (type) {
      case 'video':
        return <FiVideo className="text-red-500" size={20} />;
      case 'image':
        return <FiImage className="text-green-500" size={20} />;
      case 'pdf':
        return <FiFile className="text-blue-500" size={20} />;
      case 'link':
        return <FiLink className="text-purple-500" size={20} />;
      default:
        return <FiFile className="text-gray-500" size={20} />;
    }
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
        content,
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
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Add New Assignment</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Assignment Details
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'content'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Content & Materials ({contents.length})
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Assignment Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
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
                <input
                  id="assignment-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the assignment"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
              
              <div>
                <label htmlFor="assignment-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
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
                    <FaLinkIcon size={16} />
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
                    id="assignment-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter assignment content (Markdown & LaTeX supported)&#10;&#10;Examples:&#10;Inline math: $x^2 + y^2 = z^2$&#10;Block math: $$\int_0^1 x^2 dx$$&#10;&#10;More examples:&#10;$$f(x) = \frac{ax^2 + bx + c}{dx + e}$$&#10;$\alpha + \beta = \gamma$"
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono text-sm"
                  />
                  {content && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </label>
                      <div className="assignment-preview border border-gray-400 rounded-lg p-4 bg-white shadow-inner prose prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-black prose-em:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-a:text-blue-600 max-w-none min-h-[200px] overflow-y-auto max-h-[300px]">
                        <MDEditor.Markdown 
                          source={content} 
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
            </div>
          )}

          {/* Content & Materials Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Assignment Materials</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Add videos, documents, images, or links that students will need for this assignment.
                </p>
              </div>

              {/* Content List */}
              {contents.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h5 className="text-sm font-medium text-gray-900">
                    Current Materials ({contents.length})
                  </h5>
                  <div className="space-y-2">
                    {contents.map((content, index) => (
                      <div
                        key={content.id}
                        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-sm text-gray-500 font-mono w-8">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          {renderContentIcon(content.type)}
                          <div className="flex-1 min-w-0">
                            <h6 className="text-sm font-medium text-gray-900 truncate">
                              {content.title}
                            </h6>
                            <p className="text-xs text-gray-500 truncate">
                              {content.type.toUpperCase()} • {content.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditContent(index, content)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Edit content"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(index)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Delete content"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Form */}
              <ContentForm
                lessonContents={contents}
                onAddContent={handleAddContent}
                onEditContent={handleEditContent}
                onDeleteContent={handleDeleteContent}
              />
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Assignment Preview</h4>
                <div className="text-sm text-gray-500">
                  How students will see this assignment
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Assignment Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {title || 'Assignment Title'}
                  </h1>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span>
                      <strong>Due:</strong> {dueDate ? new Date(dueDate).toLocaleDateString() : 'Not set'}
                    </span>
                    <span>
                      <strong>Total Marks:</strong> {totalMarks || 0}
                    </span>
                  </div>
                </div>

                {/* Assignment Content */}
                <div className="p-6">
                  {/* Description */}
                  {description && (
                    <div className="mb-4">
                      <p className="text-gray-700 text-lg">{description}</p>
                    </div>
                  )}
                  
                  {/* Content */}
                  {generatePreviewContent() && (
                    <div className="assignment-preview prose prose-lg max-w-none mb-6">
                      <MDEditor.Markdown 
                        source={generatePreviewContent()} 
                        style={{ backgroundColor: 'white' }}
                        className="white-markdown-preview"
                      />
                    </div>
                  )}
                  
                  {/* Attachments Preview */}
                  {renderAttachmentsPreview()}
                  
                  {/* Show message if no content or attachments */}
                  {!description && !generatePreviewContent() && contents.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>No content to preview yet.</p>
                      <p className="text-sm">Add a description, content, or materials to see the preview.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
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
  );
} 