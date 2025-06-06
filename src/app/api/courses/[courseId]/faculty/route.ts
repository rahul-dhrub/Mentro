import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';
import mongoose from 'mongoose';

// GET /api/courses/[courseId]/faculty - Get all faculty for a course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectDB();

    const { courseId } = await params;

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate if courseId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course.faculty || [],
    });

  } catch (error) {
    console.error('Error fetching course faculty:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course faculty' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[courseId]/faculty - Add a faculty member to the course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectDB();

    const { courseId } = await params;
    const { name, email, role } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate if courseId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if faculty member already exists
    const existingFaculty = course.faculty.find((f: any) => f.email === email);
    if (existingFaculty) {
      return NextResponse.json(
        { error: 'Faculty member with this email already exists in the course' },
        { status: 409 }
      );
    }

    // Determine role - if no owner exists, make this person the owner
    const hasOwner = course.faculty.some((f: any) => f.role === 'owner');
    const assignedRole = role || (hasOwner ? 'faculty' : 'owner');

    // Add the faculty member manually
    const newFaculty = {
      id: new mongoose.Types.ObjectId().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: assignedRole,
      joinedAt: new Date(),
    };

    course.faculty.push(newFaculty);
    await course.save();

    return NextResponse.json({
      success: true,
      data: course.faculty,
      message: `Faculty member added successfully${assignedRole === 'owner' ? ' as course owner' : ''}`,
    });

  } catch (error) {
    console.error('Error adding faculty member:', error);
    return NextResponse.json(
      { error: 'Failed to add faculty member' },
      { status: 500 }
    );
  }
} 