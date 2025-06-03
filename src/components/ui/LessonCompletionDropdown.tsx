import React, { useState } from 'react';
import { FiChevronDown, FiCheck, FiClock, FiCircle } from 'react-icons/fi';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

interface LessonCompletionDropdownProps {
  lessonId: string;
  currentStatus: LessonStatus;
  onStatusChange: (lessonId: string, newStatus: LessonStatus) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    icon: FiCircle,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
  in_progress: {
    label: 'In Progress',
    icon: FiClock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  completed: {
    label: 'Completed',
    icon: FiCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

export const LessonCompletionDropdown: React.FC<LessonCompletionDropdownProps> = ({
  lessonId,
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'small'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentConfig = statusConfig[currentStatus];
  const IconComponent = currentConfig.icon;
  
  const sizeClasses = {
    small: {
      button: 'px-2 py-1 text-xs',
      dropdown: 'text-xs',
      icon: 12
    },
    medium: {
      button: 'px-3 py-2 text-sm',
      dropdown: 'text-sm',
      icon: 14
    }
  };
  
  const classes = sizeClasses[size];

  const handleStatusSelect = (newStatus: LessonStatus) => {
    console.log('Status change:', lessonId, currentStatus, '->', newStatus);
    if (newStatus !== currentStatus) {
      onStatusChange(lessonId, newStatus);
    }
    setIsOpen(false);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle dropdown:', isOpen);
    
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (e: React.MouseEvent, status: LessonStatus) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Option clicked:', status);
    handleStatusSelect(status);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          ${classes.button} ${currentConfig.bgColor} ${currentConfig.borderColor} ${currentConfig.color}
          border rounded-md flex items-center space-x-1 hover:opacity-80 transition-opacity
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <IconComponent size={classes.icon} />
        <span>{currentConfig.label}</span>
        <FiChevronDown 
          size={classes.icon} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu - Simple approach with guaranteed visibility */}
          <div className="absolute left-0 top-full z-50 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-xl overflow-visible">
            <div className="py-2 max-h-96 overflow-y-auto">
              {Object.entries(statusConfig).map(([status, config]) => {
                const OptionIcon = config.icon;
                const isSelected = status === currentStatus;
                
                return (
                  <button
                    key={status}
                    onClick={(e) => handleOptionClick(e, status as LessonStatus)}
                    className={`
                      w-full ${classes.dropdown} px-4 py-3 text-left flex items-center space-x-3
                      hover:bg-gray-50 transition-colors
                      ${isSelected ? 'bg-blue-50 font-medium border-l-2 border-blue-500' : ''}
                    `}
                  >
                    <OptionIcon 
                      size={classes.icon} 
                      className={config.color}
                    />
                    <span className={`${config.color} flex-1`}>
                      {config.label}
                    </span>
                    {isSelected && (
                      <FiCheck size={classes.icon} className="text-blue-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LessonCompletionDropdown; 