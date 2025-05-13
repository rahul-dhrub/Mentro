'use client';

import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import Calendar from 'react-calendar';
import { CalendarEvent } from '../types';
import 'react-calendar/dist/Calendar.css';

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
}

export default function CalendarView({
  events,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      return 'has-events';
    }
    return '';
  };

  const tileContent = ({ date }: { date: Date }) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      return (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
        </div>
      );
    }
    return null;
  };

  const handleDateChange = (value: any) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Course Schedule</h3>
        <button
          onClick={onAddEvent}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <FiPlus className="mr-1" />
          Add Event
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={tileClassName}
            tileContent={tileContent}
            className="w-full border-0"
          />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 mb-4">
            Events for {selectedDate.toLocaleDateString()}
          </h4>
          <div className="space-y-4">
            {getEventsForDate(selectedDate).map(event => (
              <div
                key={event.id}
                className={`p-4 rounded-lg ${
                  event.type === 'class'
                    ? 'bg-blue-50'
                    : event.type === 'assignment'
                    ? 'bg-yellow-50'
                    : 'bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900">{event.title}</h5>
                    {event.time && (
                      <p className="text-sm text-gray-500">
                        {event.time} {event.room && `• Room ${event.room}`}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditEvent(event)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteEvent(event)}
                      className="p-1 text-gray-600 hover:text-red-600"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {getEventsForDate(selectedDate).length === 0 && (
              <p className="text-gray-500 text-center py-4">No events scheduled for this date</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 