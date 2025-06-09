# Analytics Events Documentation

This document outlines all the analytics events that have been implemented throughout the Mentro application using Firebase Analytics.

## 🔧 Core Analytics Setup

### Components Added:
- **FirebaseAnalyticsProvider**: Main analytics context provider
- **AuthAnalyticsTracker**: Tracks authentication and session events
- **ErrorBoundary**: Tracks JavaScript errors and exceptions
- **PerformanceTracker**: Monitors performance metrics and API calls

## 📊 Event Categories

### 1. Authentication & User Management

#### Sign-in/Sign-up Events
- `auth_page_view`: Tracks when users visit sign-in or sign-up pages
  - `auth_type`: 'sign_in' | 'sign_up'
  - `page_location`: URL path

- `session_start`: Tracks when users successfully log in
  - `user_id`: User identifier
  - `login_method`: Authentication method
  - `has_completed_onboarding`: Boolean

- `session_end`: Tracks when users log out
  - `session_duration`: Time spent in session (ms)

- `user_return`: Tracks returning users
  - `time_since_last_login`: Time since last login (ms)
  - `days_since_last_login`: Days since last login

### 2. Navigation & User Journey

#### Navbar Interactions
- `navbar_pricing_click`: User clicks pricing in navbar
- `navbar_dropdown_toggle`: User opens/closes dropdown menus
  - `dropdown_name`: 'resources' | 'downloads'
  - `action`: 'open' | 'close'

- `navbar_resource_click`: User clicks resource links
  - `resource_type`: Type of resource
  - `resource_name`: Name of resource
  - `dropdown_name`: Parent dropdown

- `navbar_download_click`: User clicks download links
  - `download_type`: Type of download
  - `download_name`: Name of download

- `navbar_auth_click`: User clicks auth buttons
  - `auth_type`: 'login' | 'signup'
  - `page_location`: Current page

- `navbar_logo_click`: User clicks logo

#### Hero Section & CTAs
- `cta_click`: User clicks main CTA buttons
  - `cta_name`: Button name
  - `cta_location`: Where button is located
  - `user_role`: Intended user role
  - `is_signed_in`: Boolean

- `signup_redirect`: User redirected to signup
  - `source`: Where redirect originated
  - `intended_role`: User's intended role

### 3. Feed & Social Features

#### Feed Interactions
- `feed_user_select`: User selects another user's profile
  - `selected_user_id`: ID of selected user
  - `view_mode`: 'user'
  - `source`: 'search'

- `feed_hashtag_select`: User selects hashtag
  - `hashtag`: Selected hashtag
  - `view_mode`: 'hashtag'
  - `source`: 'search'

- `feed_toggle_personal_posts`: User toggles between all/personal posts
  - `is_personal`: Boolean
  - `previous_mode`: Previous mode

- `feed_sidebar_toggle`: User opens/closes sidebars
  - `action`: 'open' | 'close'
  - `sidebar_type`: 'left' | 'right'

### 4. Search & Discovery

#### Search Events
- `search_input_change`: User types in search
  - `query_length`: Length of search query
  - `search_context`: Where search is happening
  - `has_results`: Boolean

- `search_result_select`: User selects search result
  - `query`: Search query
  - `result_type`: Type of result
  - `result_id`: ID of selected result
  - `result_name`: Name of result
  - `result_position`: Position in results
  - `total_results`: Total number of results
  - `search_context`: Search context

### 5. E-commerce & Courses

#### Course Interactions
- `category_selected`: User selects course category
- `filter_applied`: User applies course filters
- `course_created`: User creates new course
- `course_detail_navigation`: User navigates to course details
- `course_edit_click`: User clicks edit course
- `course_view_details_click`: User views course details

#### Cart & Wishlist
- `add_to_cart`: User adds item to cart
- `remove_from_cart`: User removes item from cart
- `begin_checkout`: User starts checkout process

- `wishlist_page_view`: User visits wishlist page
  - `items_count`: Number of items in wishlist
  - `is_empty`: Boolean

- `wishlist_add_to_cart`: User adds wishlist item to cart
  - `course_id`: Course identifier
  - `course_title`: Course title
  - `course_price`: Course price
  - `course_category`: Course category
  - `source`: 'wishlist_page'

- `wishlist_remove_item`: User removes item from wishlist
  - `course_id`: Course identifier
  - `course_title`: Course title
  - `source`: 'wishlist_page'
  - `remaining_items`: Items left in wishlist

- `wishlist_clear_all`: User clears entire wishlist
  - `items_count`: Number of items cleared
  - `source`: 'wishlist_page'

#### Purchase Events
- `purchase`: User completes purchase
- `course_enroll`: User enrolls in course

### 6. Profile & User Management

#### Profile Events
- `profile_toast_notification`: Toast notifications shown
  - `message_type`: 'success' | 'error'
  - `is_viewing_other_user`: Boolean

### 7. Contact & Support

#### Contact Events
- `contact_button_click`: User clicks contact button
- `contact_form_submit`: User submits contact form
- `contact_form_validation_failed`: Form validation fails
- `contact_form_success`: Form submitted successfully
- `contact_form_error`: Form submission error

### 8. Performance & Technical

#### Performance Metrics
- `page_load_time`: Page load duration
- `dom_content_loaded`: DOM ready time
- `first_paint`: First paint time
- `dns_lookup_time`: DNS lookup duration
- `tcp_connection_time`: TCP connection time
- `server_response_time`: Server response time
- `largest_contentful_paint`: LCP metric
- `first_input_delay`: FID metric
- `cumulative_layout_shift`: CLS metric
- `js_heap_size_used`: Memory usage
- `api_response_time`: API call duration

#### API & Network Events
- `api_call`: API request made
  - `url`: API endpoint
  - `method`: HTTP method
  - `status`: Response status
  - `duration`: Request duration
  - `success`: Boolean

- `api_error`: API request failed
  - `url`: API endpoint
  - `method`: HTTP method
  - `duration`: Request duration
  - `error`: Error message

- `connection_info`: User's connection details
  - `effective_type`: Connection type
  - `downlink`: Download speed
  - `rtt`: Round trip time
  - `save_data`: Data saver mode

#### Error Tracking
- `exception`: JavaScript errors caught
  - `description`: Error message
  - `fatal`: Boolean
  - `error_stack`: Stack trace
  - `component_stack`: React component stack
  - `page_location`: Current page

### 9. User Engagement

#### Session & Activity
- `page_visibility_change`: Page visibility changes
  - `visibility_state`: 'visible' | 'hidden'
  - `is_authenticated`: Boolean

- `user_inactive`: User becomes inactive
  - `inactivity_duration`: Duration of inactivity
  - `page_location`: Current page

## 🎯 Analytics Methods Available

### Standard Events
- `trackPageView(pageName, pageTitle?)`
- `trackEvent(eventName, parameters?)`
- `trackLogin(method?)`
- `trackSignUp(method?)`
- `trackSearch(searchTerm, searchCategory?)`

### E-commerce Events
- `trackPurchase(transactionId, value, currency?, items?)`
- `trackAddToCart(itemId, itemName, value, currency?)`
- `trackCourseEnroll(courseId, courseName, courseCategory?)`

### Learning Events
- `trackLessonComplete(lessonId, lessonName, courseId)`
- `trackQuizAttempt(quizId, quizName, score?)`

### Enhanced Events
- `trackFormSubmit(formName, formData?)`
- `trackButtonClick(buttonName, context?, additionalData?)`
- `trackVideoEvent(action, videoId, videoTitle?, currentTime?)`
- `trackDownload(fileName, fileType, fileSize?)`
- `trackShare(contentType, contentId, method)`
- `trackEngagement(engagementType, value?, additionalData?)`
- `trackPerformance(metricName, value, unit?)`

### User Management
- `setUserProperty(properties)`
- `setAnalyticsUserId(userId)`

## 📈 Usage Examples

```typescript
// Track button click
analytics.trackButtonClick('subscribe_button', 'pricing_page', {
  plan_type: 'premium',
  discount_applied: true
});

// Track form submission
analytics.trackFormSubmit('contact_form', {
  form_fields: ['name', 'email', 'message'],
  form_valid: true
});

// Track video interaction
analytics.trackVideoEvent('play', 'intro_video_123', 'Course Introduction', 0);

// Track performance metric
analytics.trackPerformance('page_load_time', 1250, 'ms');

// Track custom event
analytics.trackEvent('feature_used', {
  feature_name: 'dark_mode',
  user_preference: 'enabled'
});
```

## 🔍 Analytics Dashboard

All events are automatically sent to Firebase Analytics and can be viewed in:
- Firebase Analytics Console
- Google Analytics 4 (if connected)
- Custom analytics dashboard (Admin portal)

## 🛠️ Implementation Notes

1. **Privacy Compliant**: All tracking respects user privacy and follows GDPR guidelines
2. **Performance Optimized**: Analytics calls are non-blocking and don't affect user experience
3. **Error Resilient**: Analytics failures don't break app functionality
4. **Comprehensive Coverage**: Tracks user journey from landing to conversion
5. **Real-time Monitoring**: Performance and error tracking for immediate insights

## 📋 Next Steps

Consider adding analytics for:
- A/B testing events
- Feature flag usage
- Content engagement metrics
- Learning progress tracking
- Social sharing events
- Mobile app events (when implemented)
- Push notification interactions 