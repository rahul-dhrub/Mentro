import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';

// GET /api/submissions/[id] - Get single submission
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const submission = await Submission.findById(id);
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // Transform submission to match frontend expectations
    const submissionObj = submission.toObject();
    const transformedSubmission = {
      ...submissionObj,
      id: submissionObj._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json({
      success: true,
      data: transformedSubmission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

// PUT /api/submissions/[id] - Update submission (for grading)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { grade, feedback, gradedBy } = body;
    const { id } = await params;
    
    const updateData: any = {};
    
    if (grade !== undefined) {
      updateData.grade = grade;
      updateData.status = 'graded';
      updateData.gradedAt = new Date();
    }
    
    if (feedback !== undefined) {
      updateData.feedback = feedback;
    }
    
    if (gradedBy) {
      updateData.gradedBy = gradedBy;
    }
    
    const submission = await Submission.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    // Transform submission to match frontend expectations
    const submissionObj = submission.toObject();
    const transformedSubmission = {
      ...submissionObj,
      id: submissionObj._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json({
      success: true,
      data: transformedSubmission
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/[id] - Delete submission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const submission = await Submission.findByIdAndDelete(id);
    
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
} 