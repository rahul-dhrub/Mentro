import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Update all existing users to admin role
    const result = await User.updateMany(
      { role: { $ne: 'admin' } }, // Find users who are not already admin
      { $set: { role: 'admin' } }  // Set them to admin
    );
    
    return NextResponse.json({ 
      message: 'User roles updated successfully',
      usersUpdated: result.modifiedCount,
      totalMatched: result.matchedCount
    });
  } catch (error: any) {
    console.error('Error updating user roles:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 