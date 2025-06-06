import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';

// GET /api/courses/categories - Get all categories with course counts
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get authentication info
    const { userId } = await auth();
    let userRole = 'student'; // Default to student
    
    // If user is authenticated, get their role
    if (userId) {
      try {
        const User = (await import('@/models/User')).default;
        const currentUser = await User.findOne({ clerkId: userId });
        if (currentUser) {
          userRole = currentUser.role || 'student';
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Continue with default student role
      }
    }
    
    // Build match filter based on user role
    let matchFilter: any = { isActive: true };
    
    // For students, only count published courses
    // For instructors/admins, count all active courses (published and unpublished)
    if (userRole === 'student') {
      matchFilter.isPublished = true;
    }
    
    // Aggregate courses by category to get counts
    const categoryCounts = await Course.aggregate([
      { 
        $match: matchFilter
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Define default categories with icons
    const defaultCategories = [
      { name: 'Development', icon: '💻' },
      { name: 'Business', icon: '📊' },
      { name: 'Design', icon: '🎨' },
      { name: 'Marketing', icon: '📈' },
      { name: 'Music', icon: '🎵' },
      { name: 'Science', icon: '🔬' },
      { name: 'Art', icon: '🎨' },
      { name: 'Language', icon: '🗣️' },
      { name: 'Health', icon: '💪' },
      { name: 'Finance', icon: '💰' }
    ];
    
    // Create a map of category counts
    const countMap = new Map(
      categoryCounts.map(item => [item._id, item.count])
    );
    
    // Merge default categories with counts
    const categories = defaultCategories.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      count: countMap.get(cat.name) || 0
    }));
    
    // Add any additional categories from the database that aren't in defaults
    categoryCounts.forEach(item => {
      if (!defaultCategories.some(cat => cat.name === item._id)) {
        categories.push({
          name: item._id,
          icon: '📚', // Default icon for custom categories
          count: item.count
        });
      }
    });
    
    // Sort by count descending
    categories.sort((a, b) => b.count - a.count);
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 