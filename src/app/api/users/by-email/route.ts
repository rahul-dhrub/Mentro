import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getAuth } from '@clerk/nextjs/server';
import User from '@/models/User';

// GET - Fetch user by email
export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Email parameter is required' }, { status: 400 });
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Return user data (excluding sensitive information)
    const userResponse = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      title: user.title,
      department: user.department,
      role: user.role
    };

    return NextResponse.json({
      message: 'User found successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Error fetching user by email:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 