'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

export default function AuthAnalyticsTracker() {
  const { user, isLoaded, isSignedIn } = useUser();
  const analytics = useAnalytics();

  // Track authentication state changes
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Track successful login
      analytics.trackLogin('clerk');
      
      // Set user properties
      analytics.setUserProperty({
        user_type: 'authenticated',
        user_role: user.publicMetadata?.role as string || 'unknown',
        signup_method: user.primaryEmailAddress?.emailAddress ? 'email' : 'unknown',
        has_profile_image: user.imageUrl ? 'true' : 'false'
      });

      // Track user session start
      analytics.trackEvent('session_start', {
        user_id: user.id,
        login_method: 'clerk',
        has_completed_onboarding: user.publicMetadata?.onboardingCompleted || false
      });

      // Track user engagement metrics
      const lastLoginTime = localStorage.getItem('lastLoginTime');
      const currentTime = Date.now();
      
      if (lastLoginTime) {
        const timeSinceLastLogin = currentTime - parseInt(lastLoginTime);
        analytics.trackEvent('user_return', {
          time_since_last_login: timeSinceLastLogin,
          days_since_last_login: Math.floor(timeSinceLastLogin / (1000 * 60 * 60 * 24))
        });
      }
      
      localStorage.setItem('lastLoginTime', currentTime.toString());
    } else {
      // Track user session end when signed out
      analytics.trackEvent('session_end', {
        session_duration: Date.now() - (parseInt(localStorage.getItem('sessionStartTime') || '0'))
      });
    }
  }, [isLoaded, isSignedIn, user, analytics]);

  // Track session duration
  useEffect(() => {
    if (isSignedIn) {
      localStorage.setItem('sessionStartTime', Date.now().toString());
    }
  }, [isSignedIn]);

  // Track page visibility changes for engagement
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isSignedIn) {
        analytics.trackEvent('page_visibility_change', {
          visibility_state: document.visibilityState,
          is_authenticated: true
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSignedIn, analytics]);

  // Track user inactivity
  useEffect(() => {
    if (!isSignedIn) return;

    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        analytics.trackEvent('user_inactive', {
          inactivity_duration: INACTIVITY_THRESHOLD,
          page_location: window.location.pathname
        });
      }, INACTIVITY_THRESHOLD);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, [isSignedIn, analytics]);

  return null; // This component doesn't render anything
} 