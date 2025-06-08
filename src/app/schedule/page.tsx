'use client';

import { useState, useEffect } from 'react';
import ScheduleHeader from './components/ScheduleHeader';
import WeekNavigation from './components/WeekNavigation';
import Timeline from './components/Timeline';
import TaskTypeLegend from './components/TaskTypeLegend';
import DaySummary from './components/DaySummary';
import TaskDetails from './components/TaskDetails';
import TaskTypeManager from './components/TaskTypeManager';
import AddEventModal from './components/AddEventModal';
import { ScheduleTask, DaySchedule, TaskType, defaultTaskTypes, AddEventFormData, getTaskTypeColors, getTaskTypeIcons } from './types';
import { scheduleAPI } from '@/lib/api/schedule';

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return startOfWeek;
  });
  const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [taskTypes, setTaskTypes] = useState<TaskType[]>(defaultTaskTypes);
  const [scheduleData, setScheduleData] = useState<DaySchedule[]>([]);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load schedule data
  useEffect(() => {
    const loadScheduleData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await scheduleAPI.getSchedule();
        if (response.success && response.schedule) {
          setScheduleData(response.schedule);
        } else {
          setError(response.error || 'Failed to load schedule');
          setScheduleData([]);
        }
      } catch (error) {
        console.error('Error loading schedule data:', error);
        setError('Failed to load schedule data');
        setScheduleData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadScheduleData();
  }, []);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthYearChange = (year: number, month: number) => {
    // Create date string directly to avoid timezone issues
    const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    const newDate = new Date(dateString + 'T00:00:00');
    setSelectedDate(newDate);
    
    // Update week to contain the new date
    const dayOfWeek = newDate.getDay();
    const startOfWeek = new Date(newDate);
    startOfWeek.setDate(newDate.getDate() - dayOfWeek);
    setCurrentWeekStart(startOfWeek);
  };

  const handleTaskClick = (task: ScheduleTask) => {
    setSelectedTask(task);
  };

  const handleAddEvent = async (eventData: AddEventFormData) => {
    try {
      const response = await scheduleAPI.createScheduleItem({
        title: eventData.title,
        type: eventData.type,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        date: eventData.date,
        location: eventData.location || undefined,
        attendees: typeof eventData.attendees === 'number' ? eventData.attendees : undefined,
        description: eventData.description || undefined,
        isOnline: eventData.isOnline,
      });

      if (response.success && response.scheduleItem) {
        const newTask = response.scheduleItem;

        // Add to schedule data locally
        setScheduleData(prevData => {
          const existingDayIndex = prevData.findIndex(day => day.date === eventData.date);
          
          if (existingDayIndex >= 0) {
            // Update existing day
            const updatedData = [...prevData];
            updatedData[existingDayIndex] = {
              ...updatedData[existingDayIndex],
              tasks: [...updatedData[existingDayIndex].tasks, newTask]
            };
            return updatedData;
          } else {
            // Add new day
            return [...prevData, {
              date: eventData.date,
              tasks: [newTask]
            }];
          }
        });
      } else {
        console.error('Failed to create schedule item:', response.error);
        alert('Failed to create schedule item. Please try again.');
      }
    } catch (error) {
      console.error('Error creating schedule item:', error);
      alert('Failed to create schedule item. Please try again.');
    }
  };

  const getSelectedDateTasks = (): ScheduleTask[] => {
    // Create timezone-safe date string
    const year = selectedDate.getFullYear();
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const dayData = scheduleData.find(day => day.date === dateString);
    return dayData?.tasks || [];
  };

  // Create timezone-safe date string for selectedDateString
  const year = selectedDate.getFullYear();
  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
  const day = selectedDate.getDate().toString().padStart(2, '0');
  const selectedDateString = `${year}-${month}-${day}`;
  
  const tasks = getSelectedDateTasks();

  // Generate colors and icons based on current task types
  const taskTypeColors = getTaskTypeColors(taskTypes);
  const taskTypeIcons = getTaskTypeIcons(taskTypes);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ScheduleHeader onAddEvent={() => setIsAddEventModalOpen(true)} />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Navigation & Task Type Management */}
          <div className="lg:col-span-1 space-y-6">
            <WeekNavigation
              currentWeekStart={currentWeekStart}
              selectedDate={selectedDate}
              onWeekChange={handleWeekChange}
              onDateSelect={handleDateSelect}
              onMonthYearChange={handleMonthYearChange}
            />
            
            <TaskTypeManager
              taskTypes={taskTypes}
              onTaskTypesChange={setTaskTypes}
            />

            <TaskTypeLegend 
              taskTypes={taskTypes}
              taskTypeColors={taskTypeColors}
              taskTypeIcons={taskTypeIcons}
            />
          </div>

          {/* Middle Column - Timeline */}
          <div className="lg:col-span-2">
            <Timeline
              tasks={tasks}
              selectedDate={selectedDateString}
              onTaskClick={handleTaskClick}
              currentTime={currentTime}
              taskTypeColors={taskTypeColors}
              taskTypeIcons={taskTypeIcons}
            />
          </div>

          {/* Right Column - Summary & Details */}
          <div className="lg:col-span-1 space-y-6">
            <DaySummary 
              tasks={tasks}
              selectedDate={selectedDateString}
              taskTypes={taskTypes}
            />
            
            {selectedTask && (
              <TaskDetails
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                taskTypes={taskTypes}
                taskTypeColors={taskTypeColors}
                taskTypeIcons={taskTypeIcons}
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onSubmit={handleAddEvent}
          taskTypes={taskTypes}
          selectedDate={selectedDateString}
        />
      )}
    </div>
  );
} 