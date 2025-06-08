import { FiX, FiClock, FiMapPin, FiUsers, FiGlobe } from 'react-icons/fi';
import { ScheduleTask, TaskType } from '../types';

interface TaskDetailsProps {
  task: ScheduleTask;
  onClose: () => void;
  taskTypes: TaskType[];
  taskTypeColors: Record<string, string>;
  taskTypeIcons: Record<string, any>;
}

export default function TaskDetails({ task, onClose, taskTypes, taskTypeColors, taskTypeIcons }: TaskDetailsProps) {
  const taskType = taskTypes.find(type => type.id === task.type);
  const IconComponent = taskTypeIcons[task.type];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiX size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Task Type Badge */}
        {taskType && (
          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${taskType.color} ${taskType.borderColor} ${taskType.textColor}`}>
            {IconComponent && <IconComponent size={16} />}
            <span className="text-sm font-medium">{taskType.name}</span>
          </div>
        )}

        {/* Title */}
        <div>
          <h4 className="text-xl font-semibold text-gray-900">{task.title}</h4>
        </div>

        {/* Time */}
        <div className="flex items-center space-x-2 text-gray-600 p-3 bg-gray-50 rounded-lg">
          <FiClock size={16} />
          <span className="font-medium">{task.startTime} - {task.endTime}</span>
        </div>

        {/* Location */}
        {task.location && (
          <div className="flex items-center space-x-2 text-gray-600 p-3 bg-gray-50 rounded-lg">
            {task.isOnline ? <FiGlobe size={16} /> : <FiMapPin size={16} />}
            <span>{task.location}</span>
            {task.isOnline && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-auto">
                Online
              </span>
            )}
          </div>
        )}

        {/* Attendees */}
        {task.attendees && (
          <div className="flex items-center space-x-2 text-gray-600 p-3 bg-gray-50 rounded-lg">
            <FiUsers size={16} />
            <span>{task.attendees} attendees</span>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
            <p className="text-sm text-gray-600 leading-relaxed p-3 bg-gray-50 rounded-lg">{task.description}</p>
          </div>
        )}
      </div>
    </div>
  );
} 