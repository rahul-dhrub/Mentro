import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

interface CourseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  categories: string[];
  isFilterModalOpen: boolean;
  onFilterModalToggle: () => void;
  filters: {
    rating: number;
    priceRange: number[];
    students: number;
  };
  onFiltersChange: (filters: {
    rating: number;
    priceRange: number[];
    students: number;
  }) => void;
}

export default function CourseFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
  isFilterModalOpen,
  onFilterModalToggle,
  filters,
  onFiltersChange,
}: CourseFiltersProps) {
  const handleFilterChange = (key: string, value: number | number[]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <button
          onClick={onFilterModalToggle}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-800 font-medium"
        >
          <FiFilter />
          <span>Filters</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategorySelect(null)}
          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <button
                onClick={onFilterModalToggle}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Minimum Rating
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-600 mt-1">
                {filters.rating} stars and above
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Price Range
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      parseFloat(e.target.value),
                      filters.priceRange[1],
                    ])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      filters.priceRange[0],
                      parseFloat(e.target.value),
                    ])
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Students Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Minimum Students
              </label>
              <input
                type="number"
                min="0"
                value={filters.students}
                onChange={(e) => handleFilterChange('students', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Minimum number of students"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  onFiltersChange({
                    rating: 0,
                    priceRange: [0, 1000],
                    students: 0,
                  });
                  onCategorySelect(null);
                }}
                className="px-4 py-2 text-gray-800 font-medium hover:text-gray-900"
              >
                Clear All
              </button>
              <button
                onClick={onFilterModalToggle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 