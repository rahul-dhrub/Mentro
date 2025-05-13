'use client';

import { useState, useMemo } from 'react';
import ProfileBanner from '../components/ProfileBanner';
import StudentProfileInfo from './components/StudentProfileInfo';
import CourseFilters from '../components/CourseFilters';
import StudentCourseCard from './components/StudentCourseCard';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  category: string;
  progress: number;
  lastAccessed?: string;
}

interface StudentProfile {
  name: string;
  role: string;
  bio: string;
  bannerImage: string;
  profileImage: string;
  totalCourses: number;
  inProgressCourses: number;
  completedCourses: number;
  expertise: string[];
  achievements: string[];
}

export default function StudentDashboard() {
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
  const studentProfile: StudentProfile = {
    name: "Alex Thompson",
    role: "Computer Science Student",
    bio: "Passionate about technology and software development. Currently pursuing a degree in Computer Science with a focus on web development and artificial intelligence. Always eager to learn and explore new technologies.",
    bannerImage: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80",
    totalCourses: 8,
    inProgressCourses: 3,
    completedCourses: 5,
    expertise: [
      "Web Development",
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "Data Structures"
    ],
    achievements: [
      "Completed Advanced Web Development Course",
      "Top 10% in Data Structures Course",
      "Built 5 Full-Stack Projects",
      "Participated in 3 Hackathons"
    ]
  };

  const courses: Course[] = [
    {
      id: "1",
      title: "Advanced Web Development",
      description: "Master modern web development techniques and frameworks.",
      thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      students: 1200,
      rating: 4.8,
      price: 49.99,
      category: "Web Development",
      progress: 75,
      lastAccessed: "2024-02-15"
    },
    {
      id: "2",
      title: "Data Structures & Algorithms",
      description: "Learn essential data structures and algorithms for coding interviews.",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      students: 800,
      rating: 4.7,
      price: 39.99,
      category: "Computer Science",
      progress: 90,
      lastAccessed: "2024-02-14"
    },
    {
      id: "3",
      title: "Machine Learning Fundamentals",
      description: "Introduction to machine learning concepts and applications.",
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      students: 600,
      rating: 4.9,
      price: 59.99,
      category: "Machine Learning",
      progress: 45,
      lastAccessed: "2024-02-13"
    },
    {
      id: "4",
      title: "React & Next.js Masterclass",
      description: "Build modern web applications with React and Next.js.",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
      students: 1500,
      rating: 4.6,
      price: 79.99,
      category: "Web Development",
      progress: 30,
      lastAccessed: "2024-02-12"
    }
  ];

  const categories = Array.from(new Set(courses.map(course => course.category)));

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    const matchesRating = course.rating >= filters.rating;
    const matchesPrice = course.price >= filters.priceRange[0] && course.price <= filters.priceRange[1];
    const matchesStudents = course.students >= filters.students;

    return matchesSearch && matchesCategory && matchesRating && matchesPrice && matchesStudents;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileBanner
        name={studentProfile.name}
        role={studentProfile.role}
        bannerImage={studentProfile.bannerImage}
        profileImage={studentProfile.profileImage}
        totalStudents={studentProfile.totalCourses}
        totalCourses={studentProfile.inProgressCourses}
        averageRating={studentProfile.completedCourses}
        onEditClick={() => setIsEditing(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <StudentProfileInfo
              bio={studentProfile.bio}
              expertise={studentProfile.expertise}
              achievements={studentProfile.achievements}
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
                <StudentCourseCard key={course.id} course={course} />
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
