import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import MonthYearPicker from './MonthYearPicker';

interface WeekNavigationProps {
  currentWeekStart: Date;
  selectedDate: Date;
  onWeekChange: (direction: 'prev' | 'next') => void;
  onDateSelect: (date: Date) => void;
  onMonthYearChange: (year: number, month: number) => void;
}

export default function WeekNavigation({ 
  currentWeekStart, 
  selectedDate, 
  onWeekChange, 
  onDateSelect,
  onMonthYearChange
}: WeekNavigationProps) {
  const weekDays = [];
  const startDate = new Date(currentWeekStart);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDays.push(date);
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Month/Year Picker and Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <MonthYearPicker 
          currentDate={selectedDate}
          onMonthYearChange={onMonthYearChange}
        />
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onWeekChange('prev')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            onClick={() => onWeekChange('next')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(date)}
            className={`p-3 text-center rounded-lg transition-colors ${
              isSelected(date)
                ? 'bg-blue-600 text-white shadow-sm'
                : isToday(date)
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200'
            }`}
          >
            <div className="text-sm font-medium">
              {formatDate(date)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 