import React from 'react';
import { Course } from '../types';
import SearchBar from './SearchBar';
import CourseGrid from './CourseGrid';

interface MainContentProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterClick: () => void;
  filteredCourses: Course[];
  isLoading?: boolean;
  userRole?: string | null;
}

export default function MainContent({ 
  searchQuery, 
  onSearchChange, 
  onFilterClick, 
  filteredCourses,
  isLoading = false,
  userRole
}: MainContentProps) {
  return (
    <div className="flex-1">
      {/* Search and Filter */}
      <SearchBar 
        searchQuery={searchQuery} 
        onSearchChange={onSearchChange} 
        onFilterClick={onFilterClick} 
      />

      {/* Course Grid */}
      <CourseGrid courses={filteredCourses} isLoading={isLoading} userRole={userRole} />
    </div>
  );
} 