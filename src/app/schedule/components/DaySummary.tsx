import { FiCalendar, FiClock, FiUsers, FiBook } from 'react-icons/fi';
import { ScheduleTask, TaskType } from '../types';

interface DaySummaryProps {
  tasks: ScheduleTask[];
  selectedDate: string;
  taskTypes: TaskType[];
}

export default function DaySummary({ tasks, selectedDate, taskTypes }: DaySummaryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTaskTypeStats = () => {
    const stats: Record<string, number> = {};
    taskTypes.forEach(type => {
      stats[type.id] = tasks.filter(task => task.type === type.id).length;
    });
    return stats;
  };

  const stats = getTaskTypeStats();
  const totalEvents = tasks.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <FiCalendar size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Day Summary</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">{formatDate(selectedDate)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600">{totalEvents}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="text-2xl font-bold text-green-600">{stats.class || 0}</div>
            <div className="text-sm text-gray-600">Classes</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Event Types</h4>
          {taskTypes.map(type => {
            const count = stats[type.id] || 0;
            if (count === 0) return null;
            
            return (
              <div key={type.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-sm ${type.color}`} />
                  <span className="text-gray-700">{type.name}</span>
                </div>
                <span className="text-gray-500 font-medium">{count}</span>
              </div>
            );
          })}
        </div>

        {tasks.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Next Event</h4>
            <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="font-medium">{tasks[0].title}</div>
              <div className="text-xs text-gray-500 mt-1">{tasks[0].startTime}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 