import { FiCalendar, FiClock, FiUsers, FiBook } from 'react-icons/fi';

export interface ScheduleTask {
  id: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: number;
  description?: string;
  isOnline?: boolean;
}

export interface DaySchedule {
  date: string;
  tasks: ScheduleTask[];
}

export interface TaskType {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

export interface AddEventFormData {
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  location: string;
  attendees: number | '';
  description: string;
  isOnline: boolean;
  date: string;
}

export const defaultTaskTypes: TaskType[] = [
  {
    id: 'class',
    name: 'Class',
    color: 'bg-blue-500',
    borderColor: 'border-blue-600',
    textColor: 'text-white',
    icon: 'FiBook'
  },
  {
    id: 'meeting',
    name: 'Meeting',
    color: 'bg-purple-500',
    borderColor: 'border-purple-600',
    textColor: 'text-white',
    icon: 'FiUsers'
  },
  {
    id: 'office-hours',
    name: 'Office Hours',
    color: 'bg-green-500',
    borderColor: 'border-green-600',
    textColor: 'text-white',
    icon: 'FiClock'
  },
  {
    id: 'research',
    name: 'Research',
    color: 'bg-orange-500',
    borderColor: 'border-orange-600',
    textColor: 'text-white',
    icon: 'FiBook'
  },
  {
    id: 'break',
    name: 'Break',
    color: 'bg-gray-400',
    borderColor: 'border-gray-500',
    textColor: 'text-white',
    icon: 'FiClock'
  },
  {
    id: 'personal',
    name: 'Personal',
    color: 'bg-pink-500',
    borderColor: 'border-pink-600',
    textColor: 'text-white',
    icon: 'FiCalendar'
  }
];

export const iconMap = {
  FiBook,
  FiUsers,
  FiClock,
  FiCalendar
};

export const getTaskTypeColors = (taskTypes: TaskType[]) => {
  const colorMap: Record<string, string> = {};
  taskTypes.forEach(type => {
    colorMap[type.id] = `${type.color} ${type.borderColor} ${type.textColor}`;
  });
  return colorMap;
};

export const getTaskTypeIcons = (taskTypes: TaskType[]) => {
  const iconMapResult: Record<string, any> = {};
  taskTypes.forEach(type => {
    iconMapResult[type.id] = iconMap[type.icon as keyof typeof iconMap] || FiBook;
  });
  return iconMapResult;
}; 