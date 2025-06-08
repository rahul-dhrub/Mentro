import { FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

interface MonthYearPickerProps {
  currentDate: Date;
  onMonthYearChange: (year: number, month: number) => void;
}

export default function MonthYearPicker({ currentDate, onMonthYearChange }: MonthYearPickerProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Generate year range (current year ± 5 years)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleMonthSelect = (monthIndex: number) => {
    onMonthYearChange(currentYear, monthIndex);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    onMonthYearChange(year, currentMonth);
    setShowYearPicker(false);
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Month Picker */}
      <div className="relative">
        <button
          onClick={() => {
            setShowMonthPicker(!showMonthPicker);
            setShowYearPicker(false);
          }}
          className="flex items-center pl-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <span className="font-medium">{months[currentMonth]}</span>
          <FiChevronDown size={16} />
        </button>

        {showMonthPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[150px]">
            <div className="py-1 max-h-60 overflow-y-auto">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    index === currentMonth 
                      ? 'bg-blue-500 text-white font-medium' 
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Year Picker */}
      <div className="relative">
        <button
          onClick={() => {
            setShowYearPicker(!showYearPicker);
            setShowMonthPicker(false);
          }}
          className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <span className="font-medium">{currentYear}</span>
          <FiChevronDown size={16} />
        </button>

        {showYearPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[100px]">
            <div className="py-1 max-h-60 overflow-y-auto">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    year === currentYear 
                      ? 'bg-blue-500 text-white font-medium' 
                      : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 