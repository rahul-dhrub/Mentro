import { TaskType } from '../types';

interface TaskTypeLegendProps {
  taskTypes: TaskType[];
  taskTypeColors: Record<string, string>;
  taskTypeIcons: Record<string, any>;
}

export default function TaskTypeLegend({ taskTypes, taskTypeColors, taskTypeIcons }: TaskTypeLegendProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Types</h3>
      <div className="space-y-3">
        {taskTypes.map((taskType) => {
          const IconComponent = taskTypeIcons[taskType.id];
          return (
            <div key={taskType.id} className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-sm ${taskType.color} ${taskType.borderColor}`} />
              {IconComponent && <IconComponent size={16} className="text-gray-600" />}
              <span className="text-sm text-gray-700">{taskType.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 