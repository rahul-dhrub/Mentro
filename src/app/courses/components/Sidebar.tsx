import React from 'react';
import { Category } from '../types';
import CreateCourseButton from './CreateCourseButton';
import CategorySidebar from './CategorySidebar';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onCreateCourseClick: () => void;
  canCreateCourses: boolean;
}

export default function Sidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  onCreateCourseClick,
  canCreateCourses
}: SidebarProps) {
  return (
    <div className="md:w-64">
      {canCreateCourses && (
        <CreateCourseButton onClick={onCreateCourseClick} />
      )}
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />
    </div>
  );
} 