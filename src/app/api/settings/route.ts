import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// GET /api/settings - Fetch user settings
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const user = await User.findOne({ clerkId: userId }).select('settings');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return settings with defaults if not set
    const settings = {
      darkMode: user.settings?.darkMode || false,
      notificationsEnabled: user.settings?.notificationsEnabled !== undefined ? user.settings.notificationsEnabled : true,
      emailNotifications: user.settings?.emailNotifications !== undefined ? user.settings.emailNotifications : true,
      pushNotifications: user.settings?.pushNotifications !== undefined ? user.settings.pushNotifications : true,
      language: user.settings?.language || 'en',
      timezone: user.settings?.timezone || 'UTC'
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { darkMode, notificationsEnabled, emailNotifications, pushNotifications, language, timezone } = body;

    // Validate input
    if (typeof darkMode !== 'undefined' && typeof darkMode !== 'boolean') {
      return NextResponse.json(
        { error: 'darkMode must be a boolean' },
        { status: 400 }
      );
    }

    if (typeof notificationsEnabled !== 'undefined' && typeof notificationsEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'notificationsEnabled must be a boolean' },
        { status: 400 }
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

    // Initialize settings if not exists
    if (!user.settings) {
      user.settings = {};
    }

    // Update only provided fields
    if (typeof darkMode !== 'undefined') {
      user.settings.darkMode = darkMode;
    }
    if (typeof notificationsEnabled !== 'undefined') {
      user.settings.notificationsEnabled = notificationsEnabled;
    }
    if (typeof emailNotifications !== 'undefined') {
      user.settings.emailNotifications = emailNotifications;
    }
    if (typeof pushNotifications !== 'undefined') {
      user.settings.pushNotifications = pushNotifications;
    }
    if (language) {
      user.settings.language = language;
    }
    if (timezone) {
      user.settings.timezone = timezone;
    }

    await user.save();

    return NextResponse.json({ 
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 