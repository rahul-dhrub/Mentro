'use client';

import { useState } from 'react';
import Navbar from './components/Navbar';
import FilterModal from './components/FilterModal';
import CreateCourseModal from './components/CreateCourseModal';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { Course, Category, CourseFilter } from './types';

export default function StudentCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [filters, setFilters] = useState<CourseFilter>({
    level: undefined,
    rating: undefined,
    duration: undefined
  });

  // Mock categories data
  const categories: Category[] = [
    { id: '1', name: 'Development', icon: '💻', courseCount: 120 },
    { id: '2', name: 'Business', icon: '📊', courseCount: 85 },
    { id: '3', name: 'Design', icon: '🎨', courseCount: 65 },
    { id: '4', name: 'Marketing', icon: '📈', courseCount: 45 },
    { id: '5', name: 'Music', icon: '🎵', courseCount: 30 }
  ];

  // Mock courses data
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      description: 'Learn web development from scratch. Master HTML, CSS, JavaScript, React, Node.js, and more.',
      instructor: {
        name: 'John Doe',
        image: 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg',
        rating: 4.8,
        reviews: 1250
      },
      rating: 4.7,
      reviews: 2500,
      students: 15000,
      price: 49.99,
      originalPrice: 199.99,
      thumbnail: 'https://wpassets.brainstation.io/app/uploads/2021/10/24135334/Web-Dev.jpg',
      category: 'Development',
      level: 'Beginner',
      duration: '45 hours',
      lastUpdated: new Date('2024-03-15'),
      features: ['Lifetime access', 'Certificate of completion', 'Downloadable resources'],
      requirements: ['Basic computer knowledge', 'No programming experience needed'],
      whatYouWillLearn: [
        'Build responsive websites',
        'Create web applications',
        'Deploy to production'
      ],
      curriculum: []
    },
    // Add more mock courses here...
  ]);

  // Filter courses based on search query and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesLevel = !filters.level || course.level === filters.level;
    const matchesRating = !filters.rating || course.rating >= filters.rating;
    const matchesDuration = !filters.duration || course.duration.includes(filters.duration);

    return matchesSearch && matchesCategory && matchesLevel && matchesRating && matchesDuration;
  });

  const handleFilterChange = (newFilters: CourseFilter) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      level: undefined,
      rating: undefined,
      duration: undefined
    });
  };

  const handleCreateCourse = (courseData: Partial<Course>) => {
    const newCourse: Course = {
      ...courseData as Course,
      id: `${courses.length + 1}`, // Generate a simple ID
    };
    
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cartCount={2}
        favoriteCount={5}
        user={{
          name: 'John Doe',
          role: 'Student',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with categories and create course button */}
          <Sidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onCreateCourseClick={() => setIsCreateCourseModalOpen(true)}
          />

          {/* Main Content with search and courses */}
          <MainContent
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFilterClick={() => setIsFilterModalOpen(true)}
            filteredCourses={filteredCourses}
          />
        </div>
      </div>

      {/* Modals */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <CreateCourseModal
        isOpen={isCreateCourseModalOpen}
        onClose={() => setIsCreateCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
      />
    </div>
  );
}
