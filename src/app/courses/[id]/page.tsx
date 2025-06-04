'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
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
  const { userId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

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
  
  // Handle retry functionality
  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state while checking authentication and role
  if (!isLoaded || isLoadingRole || isLoading) {
    return <LoadingState />;
  }

  // Show error state
  if (error || !course) {
    return <ErrorState message={error || 'Course not found'} onRetry={handleRetry} />;
  }

  // Prepare user data with actual role
  const userData = {
    name: user?.fullName || user?.firstName || 'User',
    role: userRole ? (userRole.charAt(0).toUpperCase() + userRole.slice(1)) : 'Student',
    image: user?.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };

  // Render the course layout
  return <CourseLayout course={course} user={userData} />;
} 