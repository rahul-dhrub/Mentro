import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';

// POST /api/courses/[courseId]/transfer-ownership - Transfer ownership to another faculty member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectDB();

    const { courseId } = await params;
    const { newOwnerEmail } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    if (!newOwnerEmail) {
      return NextResponse.json(
        { error: 'New owner email is required' },
        { status: 400 }
      );
    }

    const course = await Course.findOne({ code: courseId.toUpperCase() });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Find the new owner in the faculty list
    const newOwner = course.faculty.find((f: any) => 
      f.email.toLowerCase() === newOwnerEmail.toLowerCase()
    );

    if (!newOwner) {
      return NextResponse.json(
        { error: 'New owner must be an existing faculty member of this course' },
        { status: 404 }
      );
    }

    if (newOwner.role === 'owner') {
      return NextResponse.json(
        { error: 'This faculty member is already the owner' },
        { status: 400 }
      );
    }

    // Transfer ownership: current owner becomes faculty, new faculty becomes owner
    course.faculty = course.faculty.map((f: any) => {
      if (f.role === 'owner') {
        return { ...f, role: 'faculty' };
      }
      if (f.email.toLowerCase() === newOwnerEmail.toLowerCase()) {
        return { ...f, role: 'owner' };
      }
      return f;
    });

    await course.save();

    return NextResponse.json({
      success: true,
      data: course.faculty,
      message: `Ownership transferred successfully to ${newOwner.name}`,
    });

  } catch (error) {
    console.error('Error transferring ownership:', error);
    return NextResponse.json(
      { error: 'Failed to transfer ownership' },
      { status: 500 }
    );
  }
} 