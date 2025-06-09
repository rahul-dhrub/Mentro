import { useEffect } from 'react';
import { analytics } from '@/lib/firebase';
import { logEvent, setUserProperties, setUserId } from 'firebase/analytics';

export const useFirebaseAnalytics = () => {
  useEffect(() => {
    // Analytics is already initialized in firebase.ts
    // This effect just ensures the hook is ready
  }, []);

  // Track page views
  const trackPageView = (pageName: string, pageTitle?: string) => {
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_title: pageTitle || pageName,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  };

  // Track custom events
  const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
    if (analytics) {
      logEvent(analytics, eventName, parameters);
    }
  };

  // Track user login
  const trackLogin = (method: string = 'email') => {
    if (analytics) {
      logEvent(analytics, 'login', {
        method: method
      });
    }
  };

  // Track user signup
  const trackSignUp = (method: string = 'email') => {
    if (analytics) {
      logEvent(analytics, 'sign_up', {
        method: method
      });
    }
  };

  // Track course enrollment
  const trackCourseEnroll = (courseId: string, courseName: string, courseCategory?: string) => {
    if (analytics) {
      logEvent(analytics, 'course_enroll', {
        course_id: courseId,
        course_name: courseName,
        course_category: courseCategory
      });
    }
  };

  // Track lesson completion
  const trackLessonComplete = (lessonId: string, lessonName: string, courseId: string) => {
    if (analytics) {
      logEvent(analytics, 'lesson_complete', {
        lesson_id: lessonId,
        lesson_name: lessonName,
        course_id: courseId
      });
    }
  };

  // Track quiz attempts
  const trackQuizAttempt = (quizId: string, quizName: string, score?: number) => {
    if (analytics) {
      logEvent(analytics, 'quiz_attempt', {
        quiz_id: quizId,
        quiz_name: quizName,
        score: score
      });
    }
  };

  // Track search queries
  const trackSearch = (searchTerm: string, searchCategory?: string) => {
    if (analytics) {
      logEvent(analytics, 'search', {
        search_term: searchTerm,
        search_category: searchCategory
      });
    }
  };

  // Track purchases
  const trackPurchase = (transactionId: string, value: number, currency: string = 'USD', items: any[] = []) => {
    if (analytics) {
      logEvent(analytics, 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
        items: items
      });
    }
  };

  // Track add to cart
  const trackAddToCart = (itemId: string, itemName: string, value: number, currency: string = 'USD') => {
    if (analytics) {
      logEvent(analytics, 'add_to_cart' as any, {
        currency: currency,
        value: value,
        items: [{
          item_id: itemId,
          item_name: itemName,
          value: value
        }]
      });
    }
  };

  // Set user properties
  const setUserProperty = (properties: Record<string, string>) => {
    if (analytics) {
      setUserProperties(analytics, properties);
    }
  };

  // Set user ID
  const setAnalyticsUserId = (userId: string) => {
    if (analytics) {
      setUserId(analytics, userId);
    }
  };

  return {
    trackPageView,
    trackEvent,
    trackLogin,
    trackSignUp,
    trackCourseEnroll,
    trackLessonComplete,
    trackQuizAttempt,
    trackSearch,
    trackPurchase,
    trackAddToCart,
    setUserProperty,
    setAnalyticsUserId,
    isAnalyticsReady: !!analytics
  };
}; 