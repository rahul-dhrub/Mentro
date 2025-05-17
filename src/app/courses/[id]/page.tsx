'use client';

import React, { useState, useEffect } from 'react';
import { useCourseData } from './hooks/useCourseData';
import CourseLayout from './components/CourseLayout';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

// Correctly type params for Next.js
export default function CourseDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  // Get the course ID, handling both Promise and direct object access
  // for backward compatibility with different Next.js versions
  const courseId = params instanceof Promise ? React.use(params).id : params.id;
  
  const { course, isLoading, error } = useCourseData(courseId);
  
  // Handle retry functionality
  const handleRetry = () => {
    window.location.reload();
  };

  // Mock user data (in a real app, this would come from authentication state)
  const user = {
    name: 'John Doe',
    role: 'Student',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error || !course) {
    return <ErrorState message={error || 'Course not found'} onRetry={handleRetry} />;
  }

  // Render the course layout
  return <CourseLayout course={course} user={user} />;
} 