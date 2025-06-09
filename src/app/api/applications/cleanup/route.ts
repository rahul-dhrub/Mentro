import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import User from '@/models/User';

// POST /api/applications/cleanup - Fix applications with invalid applicantId references
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only allow admins to run cleanup
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Find applications with invalid applicantId (Clerk IDs instead of ObjectIds)
    const allApplications = await Application.find({}).lean();
    
    const invalidApplications = allApplications.filter(app => {
      const applicantIdStr = app.applicantId?.toString() || '';
      // Check if it's not a valid 24-character hex ObjectId
      return !/^[0-9a-fA-F]{24}$/.test(applicantIdStr);
    });

    console.log(`Found ${invalidApplications.length} applications with invalid applicantId`);

    let fixedCount = 0;
    let removedCount = 0;

    for (const app of invalidApplications) {
      const clerkId = app.applicantId?.toString();
      
      if (clerkId && clerkId.startsWith('user_')) {
        // Try to find the user by Clerk ID
        const applicantUser = await User.findOne({ clerkId });
        
        if (applicantUser) {
          // Update the application with the correct MongoDB ObjectId
          await Application.findByIdAndUpdate(app._id, {
            applicantId: applicantUser._id
          });
          fixedCount++;
          console.log(`Fixed application ${app._id}: ${clerkId} -> ${applicantUser._id}`);
        } else {
          // User not found, remove the application
          await Application.findByIdAndDelete(app._id);
          removedCount++;
          console.log(`Removed application ${app._id}: user ${clerkId} not found`);
        }
      } else {
        // Invalid format, remove the application
        await Application.findByIdAndDelete(app._id);
        removedCount++;
        console.log(`Removed application ${app._id}: invalid applicantId format`);
      }
    }

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      summary: {
        totalInvalid: invalidApplications.length,
        fixed: fixedCount,
        removed: removedCount
      }
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/applications/cleanup - Check for applications that need cleanup
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Only allow admins to check cleanup status
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Find applications with invalid applicantId
    const allApplications = await Application.find({}).lean();
    
    const invalidApplications = allApplications.filter(app => {
      const applicantIdStr = app.applicantId?.toString() || '';
      return !/^[0-9a-fA-F]{24}$/.test(applicantIdStr);
    });

    const samples = invalidApplications.slice(0, 5).map(app => ({
      _id: app._id,
      applicantId: app.applicantId,
      applicantName: app.applicantName,
      applicantEmail: app.applicantEmail,
    }));

    return NextResponse.json({
      total: allApplications.length,
      invalid: invalidApplications.length,
      needsCleanup: invalidApplications.length > 0,
      samples
    });
  } catch (error) {
    console.error('Error checking cleanup status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 