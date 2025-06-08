import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Schedule from '@/models/Schedule';

// GET - Fetch schedule data for a user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the user in database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = { userId: user._id };
    
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const scheduleItems = await Schedule
      .find(query)
      .sort({ date: 1, startTime: 1 })
      .lean();

    // Group by date for frontend compatibility
    const groupedSchedule: Record<string, any[]> = {};
    scheduleItems.forEach((item: any) => {
      if (!groupedSchedule[item.date]) {
        groupedSchedule[item.date] = [];
      }
      groupedSchedule[item.date].push({
        id: item._id.toString(),
        title: item.title,
        type: item.type,
        startTime: item.startTime,
        endTime: item.endTime,
        location: item.location,
        attendees: item.attendees,
        description: item.description,
        isOnline: item.isOnline
      });
    });

    // Convert to array format expected by frontend
    const scheduleData = Object.entries(groupedSchedule).map(([date, tasks]) => ({
      date,
      tasks
    }));

    return NextResponse.json({ 
      success: true, 
      schedule: scheduleData 
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// POST - Create a new schedule item
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find the user in database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      type,
      startTime,
      endTime,
      date,
      location,
      attendees,
      description,
      isOnline
    } = body;

    // Validate required fields
    if (!title || !type || !startTime || !endTime || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newScheduleItem = new Schedule({
      userId: user._id,
      title,
      type,
      startTime,
      endTime,
      date,
      location: location || undefined,
      attendees: attendees || undefined,
      description: description || undefined,
      isOnline: isOnline || false
    });

    const savedItem = await newScheduleItem.save();

    return NextResponse.json({
      success: true,
      scheduleItem: {
        id: savedItem._id.toString(),
        title: savedItem.title,
        type: savedItem.type,
        startTime: savedItem.startTime,
        endTime: savedItem.endTime,
        date: savedItem.date,
        location: savedItem.location,
        attendees: savedItem.attendees,
        description: savedItem.description,
        isOnline: savedItem.isOnline
      }
    });

  } catch (error) {
    console.error('Error creating schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule item' },
      { status: 500 }
    );
  }
} 