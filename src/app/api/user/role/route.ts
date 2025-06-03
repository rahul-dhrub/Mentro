import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('User role API called');
    
    const user = await currentUser();
    console.log('Clerk user:', user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : 'null');
    
    if (!user) {
      console.log('No user found, returning unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    console.log('Database connected');
    
    const dbUser = await User.findOne({ clerkId: user.id });
    console.log('Database user:', dbUser ? { id: dbUser._id, email: dbUser.email, role: dbUser.role } : 'null');
    
    if (!dbUser) {
      console.log('No database user found, returning 404');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const responseData = { 
      role: dbUser.role,
      userId: dbUser._id,
      name: dbUser.name,
      email: dbUser.email
    };
    
    console.log('Returning user data:', responseData);
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 