import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user already exists
    let dbUser = await User.findOne({ clerkId: user.id });
    
    if (dbUser) {
      // Update existing user to admin
      dbUser.role = 'admin';
      dbUser.name = user.fullName || user.firstName || 'Admin User';
      dbUser.email = user.emailAddresses[0]?.emailAddress || '';
      await dbUser.save();
    } else {
      // Create new admin user
      dbUser = await User.create({
        clerkId: user.id,
        name: user.fullName || user.firstName || 'Admin User',
        email: user.emailAddresses[0]?.emailAddress || '',
        role: 'admin',
        isOnline: true,
        lastActive: new Date()
      });
    }
    
    return NextResponse.json({ 
      message: 'Admin user setup successful',
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role
      }
    });
  } catch (error: any) {
    console.error('Error setting up admin user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 