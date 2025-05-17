import React from 'react';
import { SiZoom, SiGooglemeet } from 'react-icons/si';

interface LiveScheduleFormProps {
  scheduleDate: string;
  scheduleTime: string;
  scheduleLink: string;
  onScheduleDateChange: (date: string) => void;
  onScheduleTimeChange: (time: string) => void;
  onScheduleLinkChange: (link: string) => void;
}

export default function LiveScheduleForm({
  scheduleDate,
  scheduleTime,
  scheduleLink,
  onScheduleDateChange,
  onScheduleTimeChange,
  onScheduleLinkChange
}: LiveScheduleFormProps) {
  const handleCreateMeetingLink = (platform: 'zoom' | 'meet' | 'mentro') => {
    let link = '';
    
    switch (platform) {
      case 'zoom':
        link = 'https://zoom.us/j/';
        break;
      case 'meet':
        link = 'https://meet.google.com/';
        break;
      case 'mentro':
        link = 'https://mentro.com/meeting/';
        break;
    }
    
    onScheduleLinkChange(link);
  };
  
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            id="schedule-date"
            type="date"
            value={scheduleDate}
            onChange={(e) => onScheduleDateChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>
        <div>
          <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 mb-1">
            Time
          </label>
          <input
            id="schedule-time"
            type="time"
            value={scheduleTime}
            onChange={(e) => onScheduleTimeChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="schedule-link" className="block text-sm font-medium text-gray-700 mb-1">
          Meeting Link
        </label>
        <div className="relative">
          <input
            id="schedule-link"
            type="text"
            value={scheduleLink}
            onChange={(e) => onScheduleLinkChange(e.target.value)}
            placeholder="https://meeting-platform.com/join"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 pr-32"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-3">
            <button
              type="button"
              onClick={() => handleCreateMeetingLink('zoom')}
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
              title="Create Zoom Link"
            >
              <SiZoom size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleCreateMeetingLink('meet')}
              className="text-green-600 hover:text-green-800 cursor-pointer"
              title="Create Google Meet Link"
            >
              <SiGooglemeet size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleCreateMeetingLink('mentro')}
              className="text-purple-600 hover:text-purple-800 cursor-pointer"
              title="Create Mentro Link"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-purple-600 hover:border-purple-800">
                <span className="text-sm font-bold">M</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 