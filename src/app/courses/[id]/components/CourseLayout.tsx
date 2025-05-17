import React from 'react';
import { Course } from '../../types';
import Navbar from '../../components/Navbar';
import CourseHeader from '../../components/CourseHeader';
import CourseContent from './CourseContent';
import CourseSidebar from '../../components/CourseSidebar';

interface CourseLayoutProps {
  course: Course;
  user: {
    name: string;
    role: string;
    image: string;
  };
}

export default function CourseLayout({ course, user }: CourseLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        cartCount={2}
        favoriteCount={5}
        user={user}
      />

      <CourseHeader course={course} />

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <CourseContent course={course} />

          {/* Sidebar */}
          <CourseSidebar course={course} isDetailPage={false} />
        </div>
      </div>
    </div>
  );
} 