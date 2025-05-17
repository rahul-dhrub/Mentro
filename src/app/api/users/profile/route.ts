import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const url = new URL(request.url);
    const clerkId = url.searchParams.get('clerkId');
    
    // If no clerkId is provided, use the authenticated user's ID
    let userClerkId = clerkId;
    
    if (!userClerkId) {
      // Get auth data from Clerk
      const { userId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized. Please log in.' },
          { status: 401 }
        );
      }
      
      userClerkId = userId;
    }
    
    // Find user by their Clerk ID
    const user = await User.findOne({ clerkId: userClerkId });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return the user data
    return NextResponse.json({ user: {
      _id: user._id,
      id: user._id,
      clerkId: user.clerkId,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      title: user.title || 'Faculty Member',
      department: user.department || 'Computer Science',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }}, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 