import { FiX } from 'react-icons/fi';
import { CourseFilter } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CourseFilter;
  onFilterChange: (filters: CourseFilter) => void;
  onClearFilters: () => void;
}

export default function FilterModal({ isOpen, onClose, filters, onFilterChange, onClearFilters }: FilterModalProps) {
  if (!isOpen) return null;

  const levels = ['Beginner', 'Intermediate', 'Advanced'] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Filter Courses</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900 cursor-pointer">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Level Filter */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Level</h3>
            <div className="space-y-2">
              {levels.map((level) => (
                <label key={level} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.level === level}
                    onChange={() => onFilterChange({ ...filters, level })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-800 font-medium">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Rating</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.rating === rating}
                    onChange={() => onFilterChange({ ...filters, rating })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-800 font-medium">{rating}+ Stars</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Duration</h3>
            <div className="space-y-2">
              {['0-5 hours', '5-10 hours', '10+ hours'].map((duration) => (
                <label key={duration} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.duration === duration}
                    onChange={() => onFilterChange({ ...filters, duration })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-800 font-medium">{duration}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClearFilters}
            className="text-gray-800 hover:text-gray-900 font-medium cursor-pointer"
          >
            Clear Filters
          </button>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
} 