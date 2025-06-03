import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/Course';

// DELETE /api/courses/[courseId]/faculty/[facultyId] - Remove a faculty member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; facultyId: string }> }
) {
  try {
    await connectDB();

    const { courseId, facultyId } = await params;

    if (!courseId || !facultyId) {
      return NextResponse.json(
        { error: 'Course ID and Faculty ID are required' },
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

    // Find the faculty member to remove
    const facultyToRemove = course.faculty.find((f: any) => f.id === facultyId);
    if (!facultyToRemove) {
      return NextResponse.json(
        { error: 'Faculty member not found' },
        { status: 404 }
      );
    }

    // Prevent removing the owner (they should transfer ownership first)
    if (facultyToRemove.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove the course owner. Transfer ownership first.' },
        { status: 400 }
      );
    }

    // Remove the faculty member
    course.faculty = course.faculty.filter((f: any) => f.id !== facultyId);
    await course.save();

    return NextResponse.json({
      success: true,
      data: course.faculty,
      message: 'Faculty member removed successfully',
    });

  } catch (error) {
    console.error('Error removing faculty member:', error);
    return NextResponse.json(
      { error: 'Failed to remove faculty member' },
      { status: 500 }
    );
  }
} 