# Firebase Analytics Setup Guide

## Overview

Firebase Analytics has been successfully integrated into your Mentro app. This guide will help you complete the setup and start tracking user behavior.

## Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com  
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Navigate to Project Settings > General
4. Scroll down to "Your apps" section
5. Click "Add app" and choose "Web"
6. Register your app with a nickname (e.g., "Mentro Web")
7. Copy the configuration values to your `.env.local` file
8. Go to Analytics in the left sidebar and enable Google Analytics
9. Create or link a Google Analytics account

## Features Implemented

### Automatic Tracking
- **Page Views**: Automatically tracked on route changes
- **User Authentication**: User IDs and properties set when users sign in
- **User Properties**: Tracks authenticated status and signup method

### Available Analytics Functions

The `useAnalytics` hook provides the following tracking functions:

```typescript
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

const MyComponent = () => {
  const analytics = useAnalytics();
  
  // Track custom events
  analytics.trackEvent('button_click', { button_name: 'subscribe' });
  
  // Track course enrollment
  analytics.trackCourseEnroll('course-123', 'React Fundamentals', 'Programming');
  
  // Track lesson completion
  analytics.trackLessonComplete('lesson-456', 'State Management', 'course-123');
  
  // Track quiz attempts
  analytics.trackQuizAttempt('quiz-789', 'React Quiz', 85);
  
  // Track search queries
  analytics.trackSearch('react hooks', 'courses');
  
  // Track purchases
  analytics.trackPurchase('txn-123', 99.99, 'USD', [
    { item_id: 'course-123', item_name: 'React Course', value: 99.99 }
  ]);
  
  // Track add to cart
  analytics.trackAddToCart('course-123', 'React Course', 99.99);
  
  return <div>My Component</div>;
};
```

### Pre-built Event Tracking for Education Apps

- `trackCourseEnroll`: Track when users enroll in courses
- `trackLessonComplete`: Track lesson completion
- `trackQuizAttempt`: Track quiz attempts and scores
- `trackSearch`: Track search queries
- `trackPurchase`: Track course purchases
- `trackAddToCart`: Track when courses are added to cart
- `trackLogin`: Track user logins
- `trackSignUp`: Track user registrations

## Implementation Examples

### Track Course Enrollment
```typescript
// In your course enrollment component
const handleEnrollment = async (courseId: string, courseName: string) => {
  try {
    await enrollUserInCourse(courseId);
    analytics.trackCourseEnroll(courseId, courseName, 'Programming');
  } catch (error) {
    console.error('Enrollment failed:', error);
  }
};
```

### Track Quiz Completion
```typescript
// In your quiz component
const handleQuizSubmit = (score: number, quizId: string, quizName: string) => {
  analytics.trackQuizAttempt(quizId, quizName, score);
  // Handle quiz submission...
};
```

### Track Search Activity
```typescript
// In your search component
const handleSearch = (searchTerm: string) => {
  analytics.trackSearch(searchTerm, 'courses');
  // Perform search...
};
```

### Track E-commerce Events
```typescript
// In your cart component
const handleAddToCart = (course: Course) => {
  analytics.trackAddToCart(course.id, course.name, course.price);
  // Add to cart logic...
};

// In your checkout component
const handlePurchase = (transactionId: string, items: CartItem[]) => {
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  analytics.trackPurchase(transactionId, totalValue, 'USD', items);
  // Complete purchase...
};
```

## Data Privacy Considerations

1. **User Consent**: Consider implementing cookie consent if required by your jurisdiction
2. **Data Retention**: Configure data retention settings in Firebase Console
3. **User Data Deletion**: Implement user data deletion if needed for GDPR compliance

## Monitoring and Reports

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Navigate to Analytics in your project
3. View real-time data and custom reports
4. Set up custom audiences and conversion goals
5. Link with Google Analytics for advanced reporting

## Troubleshooting

1. **Analytics not working**: Check that measurement ID is set and valid
2. **Events not showing**: Events may take 24-48 hours to appear in reports
3. **Development vs Production**: Analytics only works on HTTPS in production

## Next Steps

1. Set up your Firebase project and get configuration values
2. Add environment variables to `.env.local`
3. Deploy and test analytics in production
4. Set up custom conversion goals in Firebase Console
5. Create custom audiences for targeted analysis

## Files Created

The following files have been created for Firebase Analytics integration:

1. **`src/lib/firebase.ts`** - Firebase configuration and initialization
2. **`src/hooks/useFirebaseAnalytics.ts`** - Custom hook with analytics functions
3. **`src/components/FirebaseAnalyticsProvider.tsx`** - React context provider for analytics
4. **`src/components/AnalyticsExample.tsx`** - Example component showing usage patterns
5. **`FIREBASE_SETUP.md`** - This setup guide

## Integration Status

Firebase Analytics has been integrated into the following components:

### Core Pages
- **Root Layout** (`src/app/layout.tsx`) - Analytics provider wrapper
- **Courses Page** (`src/app/courses/page.tsx`) - Search, filter, and category tracking
- **Cart Page** (`src/app/cart/page.tsx`) - Remove from cart and checkout tracking
- **Checkout Page** (`src/app/checkout/page.tsx`) - Purchase completion and enrollment tracking

### Landing Page Components
- **Hero Section** (`src/app/landing/components/HeroSection.tsx`) - Main CTA tracking
- **CTA Section** (`src/app/landing/components/CTASection.tsx`) - Bottom CTA tracking
- **Pricing Section** (`src/app/landing/components/PricingSection.tsx`) - Pricing plan selection

### Course Components
- **Course Card** (`src/app/courses/components/CourseCard.tsx`) - Add to cart and wishlist
- **Course Sidebar** (`src/app/courses/components/CourseSidebar.tsx`) - Course actions
- **Create Course Button** (`src/app/courses/components/CreateCourseButton.tsx`) - Course creation

### Blog Components
- **Blog Actions** (`src/app/blogs/components/BlogActions.tsx`) - Like, share, save, edit, delete

### Global Components
- **Floating Contact Button** (`src/app/components/FloatingContactButton.tsx`) - Contact initiation
- **Contact Modal** (`src/app/components/ContactModal.tsx`) - Contact form submission

## Analytics Events Being Tracked

### User Journey Events
- `cta_click` - CTA button clicks with location and user role
- `signup_redirect` - When users are redirected to sign up
- `pricing_plan_click` - Pricing plan selection
- `contact_sales_click` - Enterprise contact sales clicks
- `contact_button_click` - Contact button interactions

### Course-Related Events
- `course_view` - Course page views
- `course_enroll` - Course enrollments
- `course_created` - New course creation
- `course_edit_click` - Course edit attempts
- `course_detail_navigation` - Navigation to course details
- `add_to_cart` - Items added to cart
- `remove_from_cart` - Items removed from cart
- `add_to_wishlist` - Items added to wishlist
- `remove_from_wishlist` - Items removed from wishlist
- `buy_now_click` - Buy now button clicks
- `cart_navigation` - Navigation to cart page

### Search and Discovery
- `search` - Search queries with terms and categories
- `category_selected` - Category filter selections
- `filter_applied` - Filter usage with parameters

### E-commerce Events
- `begin_checkout` - Checkout process initiation
- `purchase` - Completed purchases with transaction details
- `lesson_complete` - Lesson completion tracking
- `quiz_attempt` - Quiz attempts with scores

### Content Engagement
- `blog_like` - Blog post likes
- `blog_share` - Blog post shares
- `blog_save` - Blog post saves
- `blog_edit_click` - Blog edit attempts
- `blog_delete_attempt` - Blog deletion attempts

### Contact and Support
- `contact_form_submit` - Contact form submissions
- `contact_form_success` - Successful form submissions
- `contact_form_error` - Form submission errors
- `contact_form_validation_failed` - Form validation failures

### Course Management
- `create_course_button_click` - Course creation button clicks
- `lesson_start` - Lesson start events
- `video_play` - Video playback events
- `resource_download` - Resource download tracking

## Testing the Integration

1. Add the environment variables to your `.env.local` file
2. Start your development server: `npm run dev`
3. Navigate through the app to generate analytics events
4. Check the browser console for any Firebase errors
5. View analytics data in Firebase Console (may take 24-48 hours to appear)

The Firebase Analytics integration is now complete and ready to track user behavior across your Mentro application! 