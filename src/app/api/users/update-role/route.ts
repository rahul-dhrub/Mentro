import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PATCH(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const body = await req.json();
    const { role } = body;
    
    // Validate role
    if (!role || !['student', 'instructor'].includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Must be either "student" or "instructor"' 
      }, { status: 400 });
    }
    
    // Find and update the user
    const dbUser = await User.findOneAndUpdate(
      { clerkId: user.id },
      { role },
      { new: true }
    ).select('-clerkId');
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: 'User role updated successfully', 
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 