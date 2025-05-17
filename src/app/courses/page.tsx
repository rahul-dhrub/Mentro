'use client';

import { useState } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import Navbar from './components/Navbar';
import CourseCard from './components/CourseCard';
import CategorySidebar from './components/CategorySidebar';
import FilterModal from './components/FilterModal';
import { Course, Category, CourseFilter } from './types';

export default function StudentCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
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
  const courses: Course[] = [
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
  ];

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
          {/* Sidebar */}
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-800 font-medium"
              >
                <FiFilter className="mr-2" />
                Filters
              </button>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* No Results */}
            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-800">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
