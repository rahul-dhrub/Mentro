# Admin Portal Documentation

## Overview

The Admin Portal provides comprehensive analytics and user management capabilities for the Mentro platform. It includes real-time user tracking, detailed analytics, and administrative controls.

## Features

### 1. Analytics Dashboard
- **Overview Statistics**: Total users, online users, new users, content counts
- **User Role Distribution**: Breakdown of users by role (admin, instructor, student)
- **Activity Trends**: Daily activity patterns and user engagement metrics
- **Most Active Users**: Top users by activity level
- **Recent Activities**: Real-time activity feed with user actions
- **Time Range Filtering**: View analytics for different time periods (1d, 7d, 30d, 90d)

### 2. Online Users Tracking
- **Real-time Online Status**: Live tracking of currently active users
- **Auto-refresh**: Updates every 30 seconds automatically
- **User Details**: Shows name, email, department, role, and last active time
- **Visual Indicators**: Green pulse animation for online status
- **Role-based Badges**: Color-coded badges for different user roles

### 3. User Management
- **User Search**: Search by name, email, or department
- **Role Filtering**: Filter users by role (admin, instructor, student)
- **Role Management**: Update user roles with inline editing
- **Pagination**: Efficient browsing of large user lists
- **Status Indicators**: Online/offline status for each user
- **User Details**: Complete user information display

## Technical Implementation

### Models

#### User Model Extensions
```typescript
interface IUser {
  clerkId: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  isOnline: boolean;
  lastActive: Date;
  // ... other fields
}
```

#### Activity Log Model
```typescript
interface IActivityLog {
  userId: ObjectId;
  userEmail: string;
  userName: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

### API Endpoints

#### Admin APIs
- `GET /api/admin/analytics` - Fetch analytics data
- `GET /api/admin/users` - Get users with filtering and pagination
- `PATCH /api/admin/users` - Update user roles and status

#### User Status APIs
- `POST /api/user/status` - Update online status and log activities
- `PATCH /api/user/status` - Send heartbeat to maintain online status
- `GET /api/user/role` - Get current user's role

#### Setup API
- `POST /api/admin/setup` - Setup first admin user

### Components

#### Admin Layout
- Responsive sidebar navigation
- Header with user controls
- Consistent styling across admin pages

#### Analytics Dashboard
- Interactive statistics cards
- Time range selector
- Activity trends visualization
- Recent activities feed

#### Online Users List
- Real-time user grid
- Auto-refresh functionality
- User status indicators
- Role-based styling

#### Users Management
- Search and filter controls
- Paginated user table
- Inline role editing
- Bulk operations support

### Online Status Tracking

#### Heartbeat System
- Automatic heartbeat every 30 seconds
- Page visibility detection
- Graceful offline handling
- Activity logging for login/logout

#### Implementation
```typescript
const useOnlineStatus = () => {
  // Manages online status
  // Sends heartbeats
  // Handles page visibility
  // Logs user activities
};
```

## Setup Instructions

### 1. Database Setup
Ensure MongoDB is connected and the following collections are available:
- `users` - User data with role and online status
- `activitylogs` - User activity tracking
- Other content collections (courses, lessons, etc.)

### 2. Admin User Setup
To create the first admin user:

1. Sign up/login with Clerk authentication
2. Make a POST request to `/api/admin/setup`
3. This will promote your account to admin role

### 3. Environment Variables
Ensure these environment variables are set:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### 4. Access Admin Portal
Navigate to `/admin` after setting up admin user.

## Security Features

### Role-Based Access Control
- Admin routes protected by middleware
- API endpoints validate admin role
- Client-side role checking for UI

### Activity Logging
- All admin actions logged
- IP address and user agent tracking
- Detailed activity descriptions
- Audit trail for compliance

### Data Protection
- Sensitive data excluded from responses
- Clerk ID hidden from admin interfaces
- Secure session management

## Usage Guidelines

### Analytics Monitoring
1. Check daily active users and engagement
2. Monitor user role distribution
3. Review activity trends for insights
4. Track content creation patterns

### User Management
1. Search for specific users
2. Update roles as needed
3. Monitor online activity
4. Review user registration patterns

### Online Users Monitoring
1. Track real-time platform usage
2. Identify peak activity times
3. Monitor user engagement levels
4. Ensure system performance

## Troubleshooting

### Common Issues

#### Users Not Showing as Online
- Check if OnlineStatusProvider is included in layout
- Verify heartbeat API endpoints are working
- Check browser console for errors

#### Analytics Not Loading
- Verify database connection
- Check if all required collections exist
- Ensure admin role is properly set

#### Permission Denied
- Confirm user has admin role
- Check API endpoint authentication
- Verify Clerk integration

### Performance Optimization

#### Database Indexes
The following indexes are automatically created:
- `ActivityLog`: userId + createdAt, action + createdAt, createdAt
- `User`: clerkId (unique), email (unique)

#### Caching Strategies
- Analytics data can be cached for better performance
- Online user lists refresh every 30 seconds
- Pagination reduces data transfer

## Future Enhancements

### Planned Features
1. **Advanced Analytics**
   - Custom date ranges
   - Export functionality
   - Detailed user journey tracking

2. **Enhanced User Management**
   - Bulk user operations
   - User import/export
   - Advanced filtering options

3. **Real-time Features**
   - WebSocket integration for live updates
   - Push notifications for admin alerts
   - Real-time chat monitoring

4. **Reporting**
   - Automated reports
   - Custom dashboard creation
   - Data visualization improvements

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team. 