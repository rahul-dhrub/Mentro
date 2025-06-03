import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiCalendar, FiClock } from 'react-icons/fi';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaHeading } from 'react-icons/fa';
import { TbMath, TbMathFunction } from 'react-icons/tb';
import MDEditor from '@uiw/react-md-editor';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import '../chaptersComponent/markdown-styles.css';
import { Quiz } from '../../../types';
import { Question, QuizModalProps, MultipleChoiceQuestion, MultiselectQuestion, TitaQuestion, DescriptiveQuestion } from './types';
import QuestionForm from './QuestionForm';
import ContentForm from '../chaptersComponent/ContentForm';
import { LessonContent } from '../chaptersComponent/types';

export default function QuizModal({ 
  isOpen, 
  onClose, 
  onAddQuiz 
}: QuizModalProps) {
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Scheduling states
  const [isScheduled, setIsScheduled] = useState(false);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [startTime, setStartTime] = useState(() => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60 * 1000); // Add 30 minutes
    const hours = String(startTime.getHours()).padStart(2, '0');
    const minutes = String(startTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [endTime, setEndTime] = useState(() => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 90 * 60 * 1000); // Add 90 minutes (30 min buffer + 60 min duration)
    const hours = String(endTime.getHours()).padStart(2, '0');
    const minutes = String(endTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  
  // Media content states
  const [contents, setContents] = useState<LessonContent[]>([]);
  
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
    try {
      const previewContainer = document.querySelector('.quiz-description-preview');
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
    setDuration('');
    setQuestions([]);
    setIsPublished(false);
    setIsScheduled(false);
    
    // Reset scheduling times to current date/time (using helper functions)
    setStartDate(getCurrentDateString());
    setStartTime(getDefaultStartTime());
    setEndDate(getCurrentDateString());
    setEndTime(getDefaultEndTime());
    
    setContents([]);
    setIsLoading(false);
    setError(null);
  };
  
  // Text formatting functions
  const insertTextFormat = (format: string) => {
    const textarea = document.getElementById('quiz-description') as HTMLTextAreaElement;
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
  
  const handleAddQuestion = (questionData: Omit<MultipleChoiceQuestion | MultiselectQuestion | TitaQuestion | DescriptiveQuestion, 'id' | 'order'>) => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      order: questions.length,
      ...questionData
    };
    setQuestions(prev => [...prev, newQuestion as Question]);
  };
  
  const handleEditQuestion = (index: number, questionData: Partial<Question>) => {
    setQuestions(prev => {
      const updated = [...prev];
      // We need to ensure type safety when updating
      const currentQuestion = updated[index];
      
      // Create a properly typed updated question based on its type
      if (currentQuestion.type === 'multiple_choice') {
        updated[index] = { ...currentQuestion, ...questionData } as MultipleChoiceQuestion;
      } else if (currentQuestion.type === 'multiselect') {
        updated[index] = { ...currentQuestion, ...questionData } as MultiselectQuestion;
      } else if (currentQuestion.type === 'tita') {
        updated[index] = { ...currentQuestion, ...questionData } as TitaQuestion;
      } else if (currentQuestion.type === 'descriptive') {
        updated[index] = { ...currentQuestion, ...questionData } as DescriptiveQuestion;
      }
      
      return updated;
    });
  };
  
  const handleDeleteQuestion = (index: number) => {
    setQuestions(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Update order of remaining questions
      return updated.map((q, idx) => ({ ...q, order: idx }));
    });
  };
  
  // Media content handlers
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
  
  // Helper to convert form date and time to ISO string
  const createDateTimeString = (dateStr: string, timeStr: string): string | null => {
    if (!dateStr || !timeStr) return null;
    
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const date = new Date(year, month - 1, day, hours, minutes);
      return date.toISOString();
    } catch (error) {
      console.error('Invalid date or time format', error);
      return null;
    }
  };
  
  const handleSaveQuiz = async () => {
    if (!title.trim() || !duration || questions.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate scheduling information if enabled
      if (isScheduled) {
        if (!startDate || !startTime || !endDate || !endTime) {
          setError('Please complete all scheduling fields');
          setIsLoading(false);
          return;
        }
        
        // Check if end date/time is after start date/time
        const startDateTime = createDateTimeString(startDate, startTime);
        const endDateTime = createDateTimeString(endDate, endTime);
        
        if (!startDateTime || !endDateTime) {
          setError('Invalid date or time format');
          setIsLoading(false);
          return;
        }
        
        if (new Date(endDateTime) <= new Date(startDateTime)) {
          setError('End date/time must be after start date/time');
          setIsLoading(false);
          return;
        }
      }
      
      // Calculate total marks
      const totalMarks = questions.reduce((sum, question) => sum + question.marks, 0);
      
      // Create quiz object
      const quizData = {
        title,
        description,
        duration: parseInt(duration),
        totalQuestions: questions.length,
        totalMarks,
        isPublished,
        questions,
        contents,
        ...(isScheduled && {
          scheduled: true,
          startDateTime: createDateTimeString(startDate, startTime),
          endDateTime: createDateTimeString(endDate, endTime)
        })
      };
      
      console.log('Saving quiz:', quizData);
      
      // Call the parent handler with the new quiz data
      await onAddQuiz(quizData as Omit<Quiz, 'id'> & { questions: Question[] });
      
      // Close modal and reset form
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper to get current date in YYYY-MM-DD format for default value
  const getCurrentDateString = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Helper to get current time in HH:MM format for default value
  const getCurrentTimeString = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Helper to get default start time (current time + 30 minutes)
  const getDefaultStartTime = (): string => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 30 * 60 * 1000); // Add 30 minutes
    const hours = String(startTime.getHours()).padStart(2, '0');
    const minutes = String(startTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Helper to get default end time (current time + 90 minutes)
  const getDefaultEndTime = (): string => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 90 * 60 * 1000); // Add 90 minutes (30 min buffer + 60 min duration)
    const hours = String(endTime.getHours()).padStart(2, '0');
    const minutes = String(endTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Custom styles for LaTeX rendering */}
        <style jsx>{`
          .quiz-description-preview .math-block {
            display: block;
            margin: 1em 0;
            text-align: center;
          }
          
          .quiz-description-preview .math-inline {
            display: inline;
          }
          
          .quiz-description-preview .katex {
            font-size: 1.1em;
          }
          
          .quiz-description-preview .katex-display {
            margin: 1em 0;
          }
        `}</style>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Add New Quiz</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Form Fields */}
        <div className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          <div>
            <label htmlFor="quiz-title" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title *
            </label>
            <input
              ref={titleInputRef}
              id="quiz-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            />
          </div>
          
          <div>
            <label htmlFor="quiz-description" className="block text-sm font-medium text-gray-700 mb-1">
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
                id="quiz-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter quiz description (Markdown & LaTeX supported)&#10;&#10;Examples:&#10;Inline math: $x^2 + y^2 = z^2$&#10;Block math: $$\int_0^1 x^2 dx$$&#10;&#10;More examples:&#10;$$f(x) = \frac{ax^2 + bx + c}{dx + e}$$&#10;$\alpha + \beta = \gamma$"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono"
              />
              {description && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preview
                  </label>
                  <div className="quiz-description-preview border border-gray-400 rounded-lg p-4 bg-white shadow-inner prose prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-black prose-em:text-gray-800 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-a:text-blue-600 max-w-none">
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
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="quiz-duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                id="quiz-duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            
            <div className="flex-1 flex items-end">
              <label className="flex items-center h-11 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Publish quiz immediately</span>
              </label>
            </div>
          </div>
          
          {/* Scheduling Section */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <input
                id="schedule-quiz"
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="schedule-quiz" className="ml-2 text-sm font-medium text-gray-700">
                Schedule this quiz
              </label>
            </div>
            
            {isScheduled && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-blue-700 mb-1">
                      Start Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-500" />
                      </div>
                      <input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={getCurrentDateString()}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-blue-700 mb-1">
                      Start Time *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiClock className="text-gray-500" />
                      </div>
                      <input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-blue-700 mb-1">
                      End Date *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiCalendar className="text-gray-500" />
                      </div>
                      <input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || getCurrentDateString()}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="end-time" className="block text-sm font-medium text-blue-700 mb-1">
                      End Time *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiClock className="text-gray-500" />
                      </div>
                      <input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-blue-600">
                  <p>Students will only be able to access the quiz between the start and end times.</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Media Content Upload Section */}
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-700 mb-3">Additional Resources</h4>
            <ContentForm
              lessonContents={contents}
              onAddContent={handleAddContent}
              onEditContent={handleEditContent}
              onDeleteContent={handleDeleteContent}
            />
          </div>
          
          {/* Questions Section */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <QuestionForm
              questions={questions}
              onAddQuestion={handleAddQuestion}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </div>

          {/* Quiz Summary */}
          {questions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg shadow-sm">
              <h4 className="font-semibold text-blue-900 mb-4 text-lg flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Quiz Summary
              </h4>
              
              {/* Summary Stats - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Questions</div>
                  <div className="text-xl font-bold text-blue-900 mt-1">{questions.length}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Total Marks</div>
                  <div className="text-xl font-bold text-blue-900 mt-1">
                    {questions.reduce((sum, q) => sum + q.marks, 0)}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-100 sm:col-span-2 lg:col-span-1">
                  <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">Question Types</div>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(questions.map(q => q.type))].map(type => {
                      const typeLabel = type === 'multiple_choice' 
                        ? 'Multiple Choice' 
                        : type === 'multiselect' 
                          ? 'Multiselect' 
                          : type === 'tita' 
                            ? 'Type Answer' 
                            : 'Descriptive';
                      const typeColor = type === 'multiple_choice' 
                        ? 'bg-blue-100 text-blue-700' 
                        : type === 'multiselect' 
                          ? 'bg-purple-100 text-purple-700' 
                          : type === 'tita' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700';
                      
                      return (
                        <span 
                          key={type}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor}`}
                        >
                          {typeLabel}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Resources */}
              {contents.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Additional Resources</div>
                      <div className="text-sm font-semibold text-blue-900 mt-1">
                        {contents.length} file{contents.length !== 1 ? 's' : ''} attached
                      </div>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Resource Types Preview */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[...new Set(contents.map(c => c.type))].map(type => {
                      const typeLabel = type === 'video' ? 'Video' : type === 'image' ? 'Image' : type === 'pdf' ? 'PDF' : 'Link';
                      const typeColor = type === 'video' 
                        ? 'bg-red-100 text-red-700' 
                        : type === 'image' 
                          ? 'bg-green-100 text-green-700' 
                          : type === 'pdf' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700';
                      
                      return (
                        <span 
                          key={type}
                          className={`px-2 py-1 text-xs font-medium rounded-full ${typeColor}`}
                        >
                          {typeLabel}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Duration Display */}
              {duration && (
                <div className="mt-3 bg-white p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-600 font-medium uppercase tracking-wide">Duration</div>
                      <div className="text-sm font-semibold text-blue-900 mt-1">{duration} minutes</div>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Indicators */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  isPublished 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {isPublished ? '✓ Will be published' : '○ Draft mode'}
                </span>
                
                {isScheduled && (
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    ⏰ Scheduled
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={!title.trim() || !duration || questions.length === 0 || isLoading}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                (!title.trim() || !duration || questions.length === 0 || isLoading)
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
                <span>Save Quiz</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 