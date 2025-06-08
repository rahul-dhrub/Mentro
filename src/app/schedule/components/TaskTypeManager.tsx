import { useState } from 'react';
import { FiPlus, FiEdit3, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import { TaskType, iconMap } from '../types';

interface TaskTypeManagerProps {
  taskTypes: TaskType[];
  onTaskTypesChange: (taskTypes: TaskType[]) => void;
}

const availableColors = [
  { name: 'Blue', color: 'bg-blue-500', borderColor: 'border-blue-600', textColor: 'text-white' },
  { name: 'Purple', color: 'bg-purple-500', borderColor: 'border-purple-600', textColor: 'text-white' },
  { name: 'Green', color: 'bg-green-500', borderColor: 'border-green-600', textColor: 'text-white' },
  { name: 'Orange', color: 'bg-orange-500', borderColor: 'border-orange-600', textColor: 'text-white' },
  { name: 'Red', color: 'bg-red-500', borderColor: 'border-red-600', textColor: 'text-white' },
  { name: 'Yellow', color: 'bg-yellow-500', borderColor: 'border-yellow-600', textColor: 'text-white' },
  { name: 'Pink', color: 'bg-pink-500', borderColor: 'border-pink-600', textColor: 'text-white' },
  { name: 'Indigo', color: 'bg-indigo-500', borderColor: 'border-indigo-600', textColor: 'text-white' },
  { name: 'Teal', color: 'bg-teal-500', borderColor: 'border-teal-600', textColor: 'text-white' },
  { name: 'Gray', color: 'bg-gray-500', borderColor: 'border-gray-600', textColor: 'text-white' }
];

const availableIcons = [
  { name: 'Book', value: 'FiBook' },
  { name: 'Users', value: 'FiUsers' },
  { name: 'Clock', value: 'FiClock' },
  { name: 'Calendar', value: 'FiCalendar' }
];

export default function TaskTypeManager({ taskTypes, onTaskTypesChange }: TaskTypeManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTaskType, setNewTaskType] = useState<Omit<TaskType, 'id'>>({
    name: '',
    color: 'bg-blue-500',
    borderColor: 'border-blue-600',
    textColor: 'text-white',
    icon: 'FiBook'
  });

  const handleAddTaskType = () => {
    if (newTaskType.name.trim()) {
      const newType: TaskType = {
        ...newTaskType,
        id: `custom-${Date.now()}`
      };
      onTaskTypesChange([...taskTypes, newType]);
      setNewTaskType({
        name: '',
        color: 'bg-blue-500',
        borderColor: 'border-blue-600',
        textColor: 'text-white',
        icon: 'FiBook'
      });
      setIsAddingNew(false);
    }
  };

  const handleEditTaskType = (id: string, updatedType: Partial<TaskType>) => {
    const updatedTypes = taskTypes.map(type =>
      type.id === id ? { ...type, ...updatedType } : type
    );
    onTaskTypesChange(updatedTypes);
    setEditingId(null);
  };

  const handleDeleteTaskType = (id: string) => {
    if (taskTypes.length > 1) { // Keep at least one task type
      const updatedTypes = taskTypes.filter(type => type.id !== id);
      onTaskTypesChange(updatedTypes);
    }
  };

  const TaskTypeForm = ({ 
    taskType, 
    onSave, 
    onCancel 
  }: { 
    taskType: Omit<TaskType, 'id'>, 
    onSave: (type: Omit<TaskType, 'id'>) => void, 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState(taskType);

    const handleColorChange = (colorOption: typeof availableColors[0]) => {
      setFormData({
        ...formData,
        color: colorOption.color,
        borderColor: colorOption.borderColor,
        textColor: colorOption.textColor
      });
    };

    return (
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Type Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task type name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {availableColors.map((colorOption) => (
                <button
                  key={colorOption.name}
                  onClick={() => handleColorChange(colorOption)}
                  className={`w-12 h-8 rounded border-2 ${colorOption.color} ${
                    formData.color === colorOption.color 
                      ? 'ring-2 ring-blue-500 ring-offset-1' 
                      : 'hover:ring-1 hover:ring-gray-400'
                  }`}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map((iconOption) => {
                const IconComponent = iconMap[iconOption.value as keyof typeof iconMap];
                return (
                  <button
                    key={iconOption.value}
                    onClick={() => setFormData({ ...formData, icon: iconOption.value })}
                    className={`flex items-center justify-center p-3 border rounded-lg transition-colors ${
                      formData.icon === iconOption.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-600'
                    }`}
                    title={iconOption.name}
                  >
                    {IconComponent && <IconComponent size={20} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${formData.color} ${formData.borderColor} ${formData.textColor}`}>
              {(() => {
                const IconComponent = iconMap[formData.icon as keyof typeof iconMap];
                return IconComponent ? <IconComponent size={16} /> : null;
              })()}
              <span className="text-sm font-medium">
                {formData.name || 'Task Type Name'}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onCancel}
              className="px-3 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={!formData.name.trim()}
              className="px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-900">Task Types</h3>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? <FiX size={20} /> : <FiEdit3 size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 p-6 space-y-4">
          {/* Existing Task Types */}
          {taskTypes.map((taskType) => (
            <div key={taskType.id}>
              {editingId === taskType.id ? (
                <TaskTypeForm
                  taskType={taskType}
                  onSave={(updatedType) => handleEditTaskType(taskType.id, updatedType)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg ${taskType.color} ${taskType.borderColor} ${taskType.textColor}`}>
                    {(() => {
                      const IconComponent = iconMap[taskType.icon as keyof typeof iconMap];
                      return IconComponent ? <IconComponent size={16} /> : null;
                    })()}
                    <span className="text-sm font-medium">{taskType.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingId(taskType.id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit task type"
                    >
                      <FiEdit3 size={16} />
                    </button>
                    {taskTypes.length > 1 && (
                      <button
                        onClick={() => handleDeleteTaskType(taskType.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete task type"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add New Task Type */}
          {isAddingNew ? (
            <TaskTypeForm
              taskType={newTaskType}
              onSave={handleAddTaskType}
              onCancel={() => setIsAddingNew(false)}
            />
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <FiPlus size={16} />
              <span>Add New Task Type</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
} 