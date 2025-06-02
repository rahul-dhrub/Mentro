import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiVideo, FiCalendar, FiClock, FiGlobe } from 'react-icons/fi';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaHeading } from 'react-icons/fa';
import { ContentType, LessonContent } from './types';
import ContentForm from './ContentForm';
import LiveScheduleForm from './LiveScheduleForm';
import MDEditor from '@uiw/react-md-editor';
import './markdown-styles.css';

// Common timezone options - All 24 major world timezones
const timezones = [
  { value: 'Pacific/Kwajalein', label: 'UTC-12: Marshall Islands', offset: -12 },
  { value: 'Pacific/Midway', label: 'UTC-11: Samoa, Midway Island', offset: -11 },
  { value: 'Pacific/Honolulu', label: 'UTC-10: Hawaii', offset: -10 },
  { value: 'America/Anchorage', label: 'UTC-9: Alaska', offset: -9 },
  { value: 'America/Los_Angeles', label: 'UTC-8: Pacific Time (US & Canada)', offset: -8 },
  { value: 'America/Denver', label: 'UTC-7: Mountain Time (US & Canada)', offset: -7 },
  { value: 'America/Chicago', label: 'UTC-6: Central Time (US & Canada)', offset: -6 },
  { value: 'America/New_York', label: 'UTC-5: Eastern Time (US & Canada)', offset: -5 },
  { value: 'America/Caracas', label: 'UTC-4: Atlantic Time, Venezuela', offset: -4 },
  { value: 'America/Sao_Paulo', label: 'UTC-3: Brazil, Argentina', offset: -3 },
  { value: 'Atlantic/South_Georgia', label: 'UTC-2: South Georgia', offset: -2 },
  { value: 'Atlantic/Azores', label: 'UTC-1: Azores, Cape Verde', offset: -1 },
  { value: 'UTC', label: 'UTC+0: Greenwich Mean Time, London', offset: 0 },
  { value: 'Europe/Paris', label: 'UTC+1: Central European Time', offset: 1 },
  { value: 'Europe/Athens', label: 'UTC+2: Eastern European Time', offset: 2 },
  { value: 'Europe/Moscow', label: 'UTC+3: Moscow, East Africa', offset: 3 },
  { value: 'Asia/Dubai', label: 'UTC+4: UAE, Azerbaijan', offset: 4 },
  { value: 'Asia/Karachi', label: 'UTC+5: Pakistan, Kazakhstan', offset: 5 },
  { value: 'Asia/Kolkata', label: 'UTC+5:30: India, Sri Lanka', offset: 5.5 },
  { value: 'Asia/Dhaka', label: 'UTC+6: Bangladesh, Central Asia', offset: 6 },
  { value: 'Asia/Bangkok', label: 'UTC+7: Thailand, Vietnam', offset: 7 },
  { value: 'Asia/Shanghai', label: 'UTC+8: China, Singapore', offset: 8 },
  { value: 'Asia/Tokyo', label: 'UTC+9: Japan, Korea', offset: 9 },
  { value: 'Australia/Sydney', label: 'UTC+10: Eastern Australia', offset: 10 },
  { value: 'Pacific/Noumea', label: 'UTC+11: New Caledonia', offset: 11 },
  { value: 'Pacific/Auckland', label: 'UTC+12: New Zealand, Fiji', offset: 12 },
];

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapterId: string | null;
  onAddLesson: (chapterId: string, lessonData: any) => void;
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
  const [lessonDate, setLessonDate] = useState('');
  const [lessonTime, setLessonTime] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [utcDate, setUtcDate] = useState('');
  const [utcTime, setUtcTime] = useState('');
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
  
  // Update UTC values whenever local date, time, or timezone changes
  useEffect(() => {
    if (lessonDate && lessonTime) {
      const utcDateTime = getUTCDateTime();
      if (utcDateTime) {
        setUtcDate(utcDateTime.date);
        setUtcTime(utcDateTime.time);
      } else {
        setUtcDate('');
        setUtcTime('');
      }
    } else {
      setUtcDate('');
      setUtcTime('');
    }
  }, [lessonDate, lessonTime, selectedTimezone]);
  
  const resetForm = () => {
    // Get current UTC date and format it for HTML date input (YYYY-MM-DD)
    const currentUTCDate = new Date().toISOString().split('T')[0];
    // Get current UTC time and format it for HTML time input (HH:MM)
    const currentUTCTime = new Date().toISOString().split('T')[1].substring(0, 5);
    
    setLessonTitle('');
    setLessonDescription('');
    setLessonDuration('');
    setLessonDate(currentUTCDate);
    setLessonTime(currentUTCTime);
    setSelectedTimezone('UTC');
    setUtcDate(currentUTCDate);
    setUtcTime(currentUTCTime);
    setLessonContents([]);
    setActiveModalTab('recorded');
    setLiveScheduleDate(currentUTCDate);
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
  
  // Function to convert local datetime to UTC
  const getUTCDateTime = () => {
    if (!lessonDate || !lessonTime) return null;
    
    try {
      // Find the selected timezone
      const timezone = timezones.find(tz => tz.value === selectedTimezone);
      if (!timezone) return null;
      
      // Parse the date and time components
      const [year, month, day] = lessonDate.split('-').map(Number);
      const [hour, minute] = lessonTime.split(':').map(Number);
      
      // Create a Date object in UTC for the selected date/time
      // We treat the input as if it's in the selected timezone
      const localDateTime = new Date(year, month - 1, day, hour, minute, 0);
      
      // Convert to UTC by subtracting the timezone offset
      // Offset is in hours, convert to milliseconds
      const offsetInMs = timezone.offset * 60 * 60 * 1000;
      const utcDateTime = new Date(localDateTime.getTime() - offsetInMs);
      
      // Format the UTC date and time
      const utcYear = utcDateTime.getFullYear();
      const utcMonth = String(utcDateTime.getMonth() + 1).padStart(2, '0');
      const utcDay = String(utcDateTime.getDate()).padStart(2, '0');
      const utcHour = String(utcDateTime.getHours()).padStart(2, '0');
      const utcMinute = String(utcDateTime.getMinutes()).padStart(2, '0');
      
      return {
        date: `${utcYear}-${utcMonth}-${utcDay}`,
        time: `${utcHour}:${utcMinute}`,
        fullDateTime: utcDateTime.toISOString()
      };
    } catch (error) {
      console.error('Error converting to UTC:', error);
      return null;
    }
  };
  
  const handleSaveLesson = () => {
    if (!lessonTitle.trim() || !chapterId) return;
    
    // Create lesson object with both local and UTC datetime
    const lessonData = {
      title: lessonTitle,
      description: lessonDescription,
      duration: lessonDuration,
      // Local timezone data
      localDate: lessonDate,
      localTime: lessonTime,
      timezone: selectedTimezone,
      // UTC data (for storage and global consistency)
      utcDate: utcDate,
      utcTime: utcTime,
      utcDateTime: utcDate && utcTime ? `${utcDate}T${utcTime}:00.000Z` : null,
      isLive: activeModalTab === 'live',
      lessonContents, // Include lesson contents for both recorded and live lessons
      ...(activeModalTab === 'live' 
        ? { liveScheduleLink }
        : {})
    };
    
    console.log('Saving lesson with timezone conversion:', lessonData);
    
    // Call the parent handler with the new lesson data
    onAddLesson(chapterId, lessonData);
    
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
          
          {/* Date, Time and Timezone Fields */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="lesson-date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-500" size={18} />
                </div>
                <input
                  id="lesson-date"
                  type="date"
                  value={lessonDate}
                  onChange={(e) => setLessonDate(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lesson-time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiClock className="text-gray-500" size={18} />
                </div>
                <input
                  id="lesson-time"
                  type="time"
                  value={lessonTime}
                  onChange={(e) => setLessonTime(e.target.value)}
                  className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>
            </div>
            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                id="timezone"
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* UTC Converted Values Display */}
          {lessonDate && lessonTime && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <FiGlobe className="text-blue-600 mr-2" size={18} />
                <h4 className="text-lg font-semibold text-blue-800">Converted UTC Date & Time</h4>
              </div>
              
              {(() => {
                const utcDateTime = getUTCDateTime();
                if (utcDateTime) {
                  return (
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Local Time</label>
                        <div className="text-sm font-medium text-gray-800">
                          {lessonDate} {lessonTime}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {timezones.find(tz => tz.value === selectedTimezone)?.label}
                        </div>
                      </div>
                      
                      <div className="bg-blue-600 rounded-lg p-3 text-white">
                        <label className="block text-xs font-medium text-blue-100 mb-1">UTC Time</label>
                        <div className="text-sm font-bold">
                          {utcDateTime.date} {utcDateTime.time}
                        </div>
                        <div className="text-xs text-blue-200 mt-1">
                          Coordinated Universal Time
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                      Unable to convert to UTC. Please check your date and time values.
                    </div>
                  );
                }
              })()}
              
              <div className="text-xs text-blue-700 bg-blue-100 rounded p-2">
                <strong>Note:</strong> The lesson will be stored and scheduled in UTC time. Students in different timezones will see the lesson time converted to their local timezone.
              </div>
            </div>
          )}
          
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
                scheduleLink={liveScheduleLink}
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