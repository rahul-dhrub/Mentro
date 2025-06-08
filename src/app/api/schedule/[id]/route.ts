import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Schedule from '@/models/Schedule';
import mongoose from 'mongoose';

// PUT - Update a schedule item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid schedule item ID' },
        { status: 400 }
      );
    }

    const updateData = {
      title,
      type,
      startTime,
      endTime,
      date,
      location: location || undefined,
      attendees: attendees || undefined,
      description: description || undefined,
      isOnline: isOnline || false
    };

    const updatedItem = await Schedule.findOneAndUpdate(
      { _id: id, userId: user._id },
      updateData,
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scheduleItem: {
        id: updatedItem._id.toString(),
        title: updatedItem.title,
        type: updatedItem.type,
        startTime: updatedItem.startTime,
        endTime: updatedItem.endTime,
        date: updatedItem.date,
        location: updatedItem.location,
        attendees: updatedItem.attendees,
        description: updatedItem.description,
        isOnline: updatedItem.isOnline
      }
    });

  } catch (error) {
    console.error('Error updating schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a schedule item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid schedule item ID' },
        { status: 400 }
      );
    }

    const result = await Schedule.findOneAndDelete({
      _id: id,
      userId: user._id
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Schedule item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule item deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting schedule item:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule item' },
      { status: 500 }
    );
  }
} 