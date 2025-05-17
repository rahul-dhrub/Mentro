import React from 'react';
import { Category } from '../types';
import CreateCourseButton from './CreateCourseButton';
import CategorySidebar from './CategorySidebar';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onCreateCourseClick: () => void;
}

export default function Sidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  onCreateCourseClick
}: SidebarProps) {
  return (
    <div className="md:w-64">
      <CreateCourseButton onClick={onCreateCourseClick} />
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />
    </div>
  );
} 