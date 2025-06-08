import { FiMapPin } from 'react-icons/fi';
import { ScheduleTask } from '../types';

interface TaskCardProps {
  task: ScheduleTask;
  onClick: (task: ScheduleTask) => void;
  taskTypeColors: Record<string, string>;
  taskTypeIcons: Record<string, any>;
}

export default function TaskCard({ 
  task, 
  onClick, 
  taskTypeColors, 
  taskTypeIcons 
}: TaskCardProps) {
  const IconComponent = taskTypeIcons[task.type];
  const colorClasses = taskTypeColors[task.type] || 'bg-gray-500 border-gray-600 text-white';

  return (
    <div
      className={`w-full h-full rounded-lg border-l-4 p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${colorClasses}`}
      onClick={() => onClick(task)}
    >
      <div className="flex items-start space-x-2">
        {IconComponent && <IconComponent size={16} className="mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{task.title}</h4>
          <p className="text-xs opacity-90">{task.startTime} - {task.endTime}</p>
          {task.location && (
            <div className="flex items-center space-x-1 text-xs opacity-90 mt-1">
              <FiMapPin size={12} />
              <span className="truncate">
                {task.location}
                {task.isOnline && ' (Online)'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 