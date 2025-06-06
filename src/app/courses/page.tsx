'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Navbar from './components/Navbar';
import FilterModal from './components/FilterModal';
import CreateCourseModal from './components/CreateCourseModal';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { Course, Category, CourseFilter } from './types';
import { coursesAPI } from '@/lib/api/courses';

export default function StudentCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [filters, setFilters] = useState<CourseFilter>({
    level: undefined,
    rating: undefined,
    duration: undefined
  });

  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      if (isLoaded && isSignedIn && userId) {
        try {
          const response = await fetch('/api/user/role');
          if (response.ok) {
            const data = await response.json();
            setUserRole(data.role);
          } else {
            console.error('Failed to fetch user role');
            setUserRole('student'); // Default to student if fetch fails
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('student'); // Default to student if error occurs
        }
      }
      setIsLoadingRole(false);
    };

    fetchUserRole();
  }, [isLoaded, isSignedIn, userId]);

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        // Convert selectedCategory ID to category name
        let categoryName: string | undefined = undefined;
        if (selectedCategory) {
          const selectedCat = categories.find(cat => cat.id === selectedCategory);
          categoryName = selectedCat?.name;
        }
        
        const response = await coursesAPI.getAll({
          category: categoryName,
          search: searchQuery || undefined,
          level: filters.level,
          // Only filter by isPublished for students
          isPublished: userRole === 'student' ? true : undefined
        });
        
        if (response.success && response.data) {
          setCourses(response.data);
        } else {
          console.error('Failed to fetch courses:', response.error);
          // Keep existing courses if fetch fails
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    // Only fetch if userRole is determined
    if (userRole !== null) {
      // Debounce search
      const timeoutId = setTimeout(() => {
        fetchCourses();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedCategory, searchQuery, filters.level, userRole, categories]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await coursesAPI.getCategories();
        
        if (response.success && response.data) {
          const formattedCategories: Category[] = response.data.map((cat, index) => ({
            id: (index + 1).toString(),
            name: cat.name,
            icon: cat.icon,
            courseCount: cat.count
          }));
          setCategories(formattedCategories);
        } else {
          // Use default categories if API fails
          setCategories([
            { id: '1', name: 'Development', icon: '💻', courseCount: 0 },
            { id: '2', name: 'Business', icon: '📊', courseCount: 0 },
            { id: '3', name: 'Design', icon: '🎨', courseCount: 0 },
            { id: '4', name: 'Marketing', icon: '📈', courseCount: 0 },
            { id: '5', name: 'Music', icon: '🎵', courseCount: 0 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Use default categories if error occurs
        setCategories([
          { id: '1', name: 'Development', icon: '💻', courseCount: 0 },
          { id: '2', name: 'Business', icon: '📊', courseCount: 0 },
          { id: '3', name: 'Design', icon: '🎨', courseCount: 0 },
          { id: '4', name: 'Marketing', icon: '📈', courseCount: 0 },
          { id: '5', name: 'Music', icon: '🎵', courseCount: 0 }
        ]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter courses based on local filters (rating, duration)
  const filteredCourses = courses.filter(course => {
    const matchesRating = !filters.rating || course.rating >= filters.rating;
    const matchesDuration = !filters.duration || course.duration.includes(filters.duration);
    return matchesRating && matchesDuration;
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

  const handleCreateCourse = (newCourse: Course) => {
    // The course has already been created in the database by the modal
    // Just add it to the local state and refresh categories
    setCourses(prevCourses => [newCourse, ...prevCourses]);
    
    // Refresh categories to update the course count
    const refreshCategories = async () => {
      try {
        const response = await coursesAPI.getCategories();
        if (response.success && response.data) {
          const formattedCategories: Category[] = response.data.map((cat, index) => ({
            id: (index + 1).toString(),
            name: cat.name,
            icon: cat.icon,
            courseCount: cat.count
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Error refreshing categories:', error);
      }
    };
    
    refreshCategories();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleGoBack = () => {
    router.back();
  };

  // Show loading state while checking authentication and role
  if (!isLoaded || isLoadingRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user can create courses (instructor or admin)
  const canCreateCourses = userRole === 'instructor' || userRole === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={{
          name: user?.fullName || user?.firstName || 'User',
          role: userRole ? (userRole.charAt(0).toUpperCase() + userRole.slice(1)) : 'Student',
          image: user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        }}
        showBackButton={true}
        onBackClick={handleGoBack}
        backButtonText="Back"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600">Discover and enroll in courses that match your interests</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with categories and create course button */}
          <Sidebar 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
            onCreateCourseClick={() => setIsCreateCourseModalOpen(true)}
            canCreateCourses={canCreateCourses}
          />

          {/* Main Content with search and courses */}
          <MainContent
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onFilterClick={() => setIsFilterModalOpen(true)}
            filteredCourses={filteredCourses}
            isLoading={isLoadingCourses}
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

      {/* Only show CreateCourseModal if user can create courses */}
      {canCreateCourses && (
        <CreateCourseModal
          isOpen={isCreateCourseModalOpen}
          onClose={() => setIsCreateCourseModalOpen(false)}
          onSubmit={handleCreateCourse}
        />
      )}
    </div>
  );
}
