'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

interface HeroSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function HeroSection({ activeTab, setActiveTab }: HeroSectionProps) {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const analytics = useAnalytics();

  const handleRoleSelection = async (role: 'student' | 'instructor') => {
    // Track CTA click
    analytics.trackEvent('cta_click', {
      cta_name: role === 'student' ? 'start_learning' : 'start_tutoring',
      cta_location: 'hero_section',
      user_role: role,
      is_signed_in: isSignedIn
    });

    // Clear any previous errors
    setError(null);

    // Wait for Clerk to load
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      // Track sign-in redirect
      analytics.trackEvent('signup_redirect', {
        source: 'hero_section',
        intended_role: role
      });
      // If user is not signed in, redirect to sign-in page
      router.push('/sign-in');
      return;
    }

    setIsUpdating(true);
    
    try {
      const response = await fetch('/api/users/update-role', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        // Successfully updated role, redirect to feed
        router.push('/feed');
      } else {
        const errorData = await response.json();
        console.error('Failed to update role:', errorData.error);
        setError('Failed to update your role. Redirecting anyway...');
        // Still redirect to feed after a short delay, user can set role later
        setTimeout(() => {
          router.push('/feed');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Network error. Redirecting to feed...');
      // Still redirect to feed after a short delay, user can set role later
      setTimeout(() => {
        router.push('/feed');
      }, 2000);
    } finally {
      setIsUpdating(false);
    }
  };

  const buttonText = (baseText: string) => {
    if (!isLoaded) return 'Loading...';
    if (isUpdating) return 'Setting up...';
    return baseText;
  };

  const isDisabled = !isLoaded || isUpdating;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Transform Education, Connect Globally
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Join our global learning community where tutors create custom curricula and learners
            discover personalized educational experiences.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-md mx-auto">
              {error}
            </div>
          )}
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleRoleSelection('student')}
              disabled={isDisabled}
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buttonText('Start Learning')}
            </button>
            <button
              onClick={() => handleRoleSelection('instructor')}
              disabled={isDisabled}
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buttonText('Start Tutoring')}
            </button>
          </div>
          
          {!isSignedIn && isLoaded && (
            <p className="text-white text-sm mt-4 opacity-75">
              Click either button to sign in and get started
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 