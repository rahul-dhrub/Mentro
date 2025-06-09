'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useFirebaseAnalytics } from '@/hooks/useFirebaseAnalytics';

interface AnalyticsContextType {
  trackPageView: (pageName: string, pageTitle?: string) => void;
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackLogin: (method?: string) => void;
  trackSignUp: (method?: string) => void;
  trackCourseEnroll: (courseId: string, courseName: string, courseCategory?: string) => void;
  trackLessonComplete: (lessonId: string, lessonName: string, courseId: string) => void;
  trackQuizAttempt: (quizId: string, quizName: string, score?: number) => void;
  trackSearch: (searchTerm: string, searchCategory?: string) => void;
  trackPurchase: (transactionId: string, value: number, currency?: string, items?: any[]) => void;
  trackAddToCart: (itemId: string, itemName: string, value: number, currency?: string) => void;
  trackFormSubmit: (formName: string, formData?: Record<string, any>) => void;
  trackButtonClick: (buttonName: string, context?: string, additionalData?: Record<string, any>) => void;
  trackVideoEvent: (action: 'play' | 'pause' | 'complete' | 'seek', videoId: string, videoTitle?: string, currentTime?: number) => void;
  trackDownload: (fileName: string, fileType: string, fileSize?: number) => void;
  trackShare: (contentType: string, contentId: string, method: string) => void;
  trackEngagement: (engagementType: string, value?: number, additionalData?: Record<string, any>) => void;
  trackPerformance: (metricName: string, value: number, unit?: string) => void;
  setUserProperty: (properties: Record<string, string>) => void;
  setAnalyticsUserId: (userId: string) => void;
  isAnalyticsReady: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface FirebaseAnalyticsProviderProps {
  children: ReactNode;
}

export const FirebaseAnalyticsProvider = ({ children }: FirebaseAnalyticsProviderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const analytics = useFirebaseAnalytics();

  // Track page views on route changes
  useEffect(() => {
    if (analytics.isAnalyticsReady) {
      const pageName = pathname || 'Unknown Page';
      analytics.trackPageView(pageName);
    }
  }, [pathname, analytics]);

  // Set user properties when user is loaded
  useEffect(() => {
    if (isLoaded && user && analytics.isAnalyticsReady) {
      analytics.setAnalyticsUserId(user.id);
      
      // Set user properties
      analytics.setUserProperty({
        user_type: 'authenticated',
        signup_method: user.primaryEmailAddress?.emailAddress ? 'email' : 'unknown'
      });
    }
  }, [user, isLoaded, analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook to use analytics context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within a FirebaseAnalyticsProvider');
  }
  return context;
}; 