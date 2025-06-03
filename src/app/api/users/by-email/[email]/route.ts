import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    await connectDB();
    
    const { email } = await params;
    
    // Decode the email parameter in case it was URL encoded
    const decodedEmail = decodeURIComponent(email);
    
    const user = await User.findOne({ 
      email: decodedEmail.toLowerCase() 
    }).select('name email profilePicture bio title department createdAt updatedAt');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        title: user.title,
        department: user.department,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching user by email:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 