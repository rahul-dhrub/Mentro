# Database Setup Guide

This guide will help you set up the database for the quiz functionality in the Mentro application.

## Prerequisites

1. MongoDB installed locally OR MongoDB Atlas account
2. Node.js and npm installed
3. Clerk account for authentication (optional but recommended)

## Environment Configuration

1. Create a `.env.local` file in the root directory of your project:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/mentro

# For MongoDB Atlas (cloud), use the connection string format:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mentro?retryWrites=true&w=majority

# Clerk Authentication (Required for user authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# API Configuration (leave empty for same domain)
NEXT_PUBLIC_API_URL=
```

## MongoDB Setup Options

### Option 1: Local MongoDB

1. Install MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   # Start MongoDB service from Services panel or command line
   ```
3. Use the default connection string: `mongodb://localhost:27017/mentro`

### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add your IP address to the IP Access List
4. Create a database user with read/write permissions
5. Get your connection string from the "Connect" button
6. Replace the connection string in your `.env.local` file

## Clerk Authentication Setup

1. Create a free account at [Clerk](https://clerk.com/)
2. Create a new application
3. Copy your publishable key and secret key to the `.env.local` file
4. Configure the sign-in/sign-up URLs as needed

## Database Schema

The application automatically creates the following collections:

### Quizzes Collection
- **title**: String (required) - Quiz title
- **description**: String - Quiz description with Markdown and LaTeX support
- **duration**: Number (required) - Duration in minutes
- **totalMarks**: Number - Automatically calculated from questions
- **totalQuestions**: Number - Automatically calculated from questions
- **isPublished**: Boolean - Whether the quiz is published
- **scheduled**: Boolean - Whether the quiz is scheduled
- **startDateTime**: Date - Start time for scheduled quizzes
- **endDateTime**: Date - End time for scheduled quizzes
- **questions**: Array - Array of question objects
- **contents**: Array - Additional resources (videos, documents, etc.)
- **courseId**: String (required) - Associated course ID
- **lessonId**: String - Associated lesson ID (optional)
- **createdBy**: String (required) - User ID who created the quiz
- **attempts**: Number - Number of attempts allowed
- **createdAt**: Date - Creation timestamp
- **updatedAt**: Date - Last update timestamp

### Question Types Supported
1. **Multiple Choice** - Single correct answer
2. **Multiselect** - Multiple correct answers
3. **TITA (Type in the Answer)** - Text-based answers
4. **Descriptive** - Long-form answers

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing the Database Connection

1. Navigate to a course page
2. Go to the "Quizzes" tab
3. Click "Add Quiz" to test the creation functionality
4. Check your MongoDB database to see if the quiz was created

## API Endpoints

The following API endpoints are available:

- `GET /api/quizzes` - Get all quizzes (with optional courseId filter)
- `POST /api/quizzes` - Create a new quiz
- `GET /api/quizzes/[id]` - Get a specific quiz by ID
- `PUT /api/quizzes/[id]` - Update a quiz
- `DELETE /api/quizzes/[id]` - Delete a quiz

## Features Included

✅ **Database CRUD Operations** - Create, Read, Update, Delete quizzes  
✅ **User Authentication** - Secure access with Clerk  
✅ **Data Validation** - Comprehensive validation on both client and server  
✅ **LaTeX Support** - Mathematical expressions in descriptions  
✅ **Scheduling** - Schedule quizzes for specific time periods  
✅ **Multiple Question Types** - Support for various question formats  
✅ **Additional Resources** - Attach files and media to quizzes  
✅ **Auto-calculation** - Total marks and questions calculated automatically  
✅ **Error Handling** - Graceful error handling and user feedback  

## Troubleshooting

### Common Issues

1. **Connection refused**: Make sure MongoDB is running
2. **Authentication failed**: Check your Clerk keys in `.env.local`
3. **Quiz not saving**: Check browser console for validation errors
4. **Database not found**: Make sure MONGODB_URI is correct

### Database Connection Test

You can test the database connection by checking the server logs when starting the application. Look for successful connection messages.

### Need Help?

- Check the MongoDB connection string format
- Ensure all environment variables are set correctly
- Verify that MongoDB service is running
- Check Clerk dashboard for authentication issues 