'use client';

import { useState, useMemo } from 'react';
import ProfileBanner from '../components/ProfileBanner';
import ProfileInfo from '../components/ProfileInfo';
import CourseCard from '../components/CourseCard';
import CourseFilters from '../components/CourseFilters';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  category: string;
}

interface FacultyProfile {
  name: string;
  role: string;
  bio: string;
  bannerImage: string;
  profileImage: string;
  totalStudents: number;
  totalCourses: number;
  averageRating: number;
  expertise: string[];
  achievements: string[];
}

export default function FacultyDashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    rating: 0,
    priceRange: [0, 1000],
    students: 0,
  });

  // Mock data
  const facultyProfile: FacultyProfile = {
    name: "Dr. Sarah Johnson",
    role: "Senior Professor of Computer Science",
    bio: "Dr. Sarah Johnson is a distinguished professor with over 15 years of experience in teaching and research. She specializes in artificial intelligence, machine learning, and data science. Her innovative teaching methods and research contributions have earned her numerous accolades in the academic community.",
    bannerImage: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    profileImage: "https://africanshapers.com/wp-content/uploads/2023/05/sarah_mensah_profile2.jpg",
    totalStudents: 2500,
    totalCourses: 12,
    averageRating: 4.8,
    expertise: [
      "Artificial Intelligence",
      "Machine Learning",
      "Data Science",
      "Python Programming",
      "Deep Learning",
      "Natural Language Processing"
    ],
    achievements: [
      "Best Professor Award 2023",
      "Research Excellence Award",
      "Innovative Teaching Methods Recognition",
      "Published 50+ Research Papers"
    ]
  };

  const courses: Course[] = [
    {
      id: "1",
      title: "Introduction to Machine Learning",
      description: "Learn the fundamentals of machine learning algorithms and their applications.",
      thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      students: 1200,
      rating: 4.8,
      price: 49.99,
      category: "Machine Learning"
    },
    {
      id: "2",
      title: "Advanced Python Programming",
      description: "Master Python programming with advanced concepts and best practices.",
      thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      students: 800,
      rating: 4.7,
      price: 39.99,
      category: "Programming"
    },
    {
      id: "3",
      title: "Deep Learning Fundamentals",
      description: "Explore the world of deep learning and neural networks.",
      thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      students: 600,
      rating: 4.9,
      price: 59.99,
      category: "Deep Learning"
    },
    {
      id: "4",
      title: "Data Science Bootcamp",
      description: "Comprehensive course covering all aspects of data science.",
      thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      students: 1500,
      rating: 4.6,
      price: 79.99,
      category: "Data Science"
    }
  ];

  const categories = Array.from(new Set(courses.map(course => course.category)));

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || course.category === selectedCategory;
      const matchesRating = course.rating >= filters.rating;
      const matchesPrice = course.price >= filters.priceRange[0] && course.price <= filters.priceRange[1];
      const matchesStudents = course.students >= filters.students;

      return matchesSearch && matchesCategory && matchesRating && matchesPrice && matchesStudents;
    });
  }, [courses, searchQuery, selectedCategory, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileBanner
        name={facultyProfile.name}
        role={facultyProfile.role}
        bannerImage={facultyProfile.bannerImage}
        profileImage={facultyProfile.profileImage}
        totalStudents={facultyProfile.totalStudents}
        totalCourses={facultyProfile.totalCourses}
        averageRating={facultyProfile.averageRating}
        onEditClick={() => setIsEditing(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <ProfileInfo
              bio={facultyProfile.bio}
              expertise={facultyProfile.expertise}
              achievements={facultyProfile.achievements}
              onDonate={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <CourseFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              categories={categories}
              isFilterModalOpen={isFilterModalOpen}
              onFilterModalToggle={() => setIsFilterModalOpen(!isFilterModalOpen)}
              filters={filters}
              onFiltersChange={setFilters}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-800">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
