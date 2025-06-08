import TaskCard from './TaskCard';
import CurrentTimeIndicator from './CurrentTimeIndicator';
import { ScheduleTask } from '../types';

interface TimelineProps {
  tasks: ScheduleTask[];
  selectedDate: string;
  onTaskClick: (task: ScheduleTask) => void;
  currentTime: Date;
  taskTypeColors: Record<string, string>;
  taskTypeIcons: Record<string, any>;
}

export default function Timeline({ 
  tasks, 
  selectedDate, 
  onTaskClick, 
  currentTime, 
  taskTypeColors, 
  taskTypeIcons 
}: TimelineProps) {
  const timeSlots = [];
  
  // Generate time slots from 12AM to 11PM (24 hour period)
  for (let hour = 0; hour <= 23; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  const getTaskPosition = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const top = (startMinutes / 60) * 60; // 60px per hour
    const height = ((endMinutes - startMinutes) / 60) * 60;
    
    return { top, height };
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
      </div>
      
      <div className="relative" style={{ height: '700px' }}>
        <div className="overflow-y-auto h-full">
          <div className="relative" style={{ height: '1440px' }}>
            {/* Time slots */}
            <div className="absolute left-0 top-0 w-20 h-full pl-4">
              {timeSlots.map((time, index) => (
                <div key={time} className="relative" style={{ height: '60px' }}>
                  <div className="absolute top-0 left-0 w-full text-xs text-gray-500 font-medium">
                    {formatTime(time)}
                  </div>
                  {/* Hour line */}
                  <div className="absolute top-0 left-14 w-2 h-px bg-gray-300"></div>
                  {/* Half hour line */}
                  <div className="absolute top-7 left-12 w-1 h-px bg-gray-200" style={{ top: '30px' }}></div>
                  {/* Quarter hour lines */}
                  <div className="absolute left-10 w-0.5 h-px bg-gray-100" style={{ top: '15px' }}></div>
                  <div className="absolute left-10 w-0.5 h-px bg-gray-100" style={{ top: '45px' }}></div>
                </div>
              ))}
            </div>

            {/* Timeline grid */}
            <div className="absolute left-20 top-0 right-0 h-full border-l border-gray-200">
              {timeSlots.map((time, index) => (
                <div key={time} className="border-b border-gray-100" style={{ height: '60px' }}></div>
              ))}
            </div>

            {/* Current time indicator */}
            {isToday() && (
              <CurrentTimeIndicator currentTime={currentTime} />
            )}

            {/* Tasks */}
            <div className="absolute left-20 top-0 right-0">
              {tasks.map((task) => {
                const position = getTaskPosition(task.startTime, task.endTime);
                return (
                  <div
                    key={task.id}
                    className="absolute left-2 right-2"
                    style={{
                      top: `${position.top}px`,
                      height: `${position.height}px`,
                    }}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      taskTypeColors={taskTypeColors}
                      taskTypeIcons={taskTypeIcons}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 