import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getAllActiveUsers } from '@/lib/redis';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Course from '@/models/Course';

// GET - Check online status of students in a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { courseId } = await params;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    // Fetch the course and its enrolled students
    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Get all active users from Redis (heartbeat system)
    const activeUsers = await getAllActiveUsers();
    
    // Create a map of userId to online status for quick lookup
    const onlineStatusMap = new Map();
    
    activeUsers.forEach(user => {
      // Use the status already calculated by getAllActiveUsers (which uses Redis timing logic)
      const status = user.status || 'offline';
      const lastSeenMs = user.lastSeenMs || 0;
      const seconds = Math.floor(lastSeenMs / 1000);
      
      // User status calculated by Redis timing logic
      
      onlineStatusMap.set(user.userId, {
        status,
        lastSeen: user.lastSeen,
        lastSeenMs: lastSeenMs,
        lastActiveFormatted: formatLastActive(lastSeenMs)
      });
    });

    // Map enrolled students to their online status
    const studentOnlineStatus = (course.enrolledStudents || []).map((student: any) => {
      const onlineInfo = onlineStatusMap.get(student.userId) || {
        status: 'offline',
        lastSeen: null,
        lastSeenMs: 0,
        lastActiveFormatted: 'Unknown'
      };

      return {
        userId: student.userId,
        lessonsCompleted: student.lessonsCompleted,
        ...onlineInfo
      };
    });

    return NextResponse.json({
      courseId,
      students: studentOnlineStatus,
      total: studentOnlineStatus.length,
      onlineCount: studentOnlineStatus.filter(s => s.status === 'online').length,
      awayCount: studentOnlineStatus.filter(s => s.status === 'away').length,
      offlineCount: studentOnlineStatus.filter(s => s.status === 'offline').length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking student online status:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatLastActive(lastSeenMs: number): string {
  const seconds = Math.floor(lastSeenMs / 1000);
  
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
} 