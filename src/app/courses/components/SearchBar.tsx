import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterClick: () => void;
}

export default function SearchBar({ searchQuery, onSearchChange, onFilterClick }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={onSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
      <button
        onClick={onFilterClick}
        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-800 font-medium cursor-pointer"
      >
        <FiFilter className="mr-2" />
        Filters
      </button>
    </div>
  );
} 