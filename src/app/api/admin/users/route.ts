import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import ActivityLog from '@/models/ActivityLog';

// Helper function to check if user is admin
async function isAdmin() {
  try {
    const user = await currentUser();
    if (!user) return false;
    
    await connectDB();
    const dbUser = await User.findOne({ clerkId: user.id });
    return dbUser?.role === 'admin';
  } catch (error) {
    return false;
  }
}

// Get all users with pagination and filters
export async function GET(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const onlineOnly = searchParams.get('onlineOnly') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query: any = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (onlineOnly) {
      query.isOnline = true;
    }
    
    const users = await User.find(query)
      .select('-clerkId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);
    
    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user role or status
export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const body = await req.json();
    const { userId, role, isOnline } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const updateData: any = {};
    if (role) updateData.role = role;
    if (typeof isOnline === 'boolean') updateData.isOnline = isOnline;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-clerkId');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Log the activity
    const adminUser = await currentUser();
    const adminDbUser = await User.findOne({ clerkId: adminUser?.id });
    
    await ActivityLog.create({
      userId: adminDbUser?._id,
      userEmail: adminDbUser?.email,
      userName: adminDbUser?.name,
      action: 'other',
      resourceType: 'user',
      resourceId: userId,
      details: `Updated user ${user.name} - ${JSON.stringify(updateData)}`,
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      userAgent: req.headers.get('user-agent')
    });
    
    return NextResponse.json({ message: 'User updated successfully', user });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 