import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';

// GET /api/submissions - Get submissions (with filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const userId = searchParams.get('userId');
    
    let filter: any = {};
    
    if (assignmentId) {
      filter.assignmentId = assignmentId;
    }
    
    if (userId) {
      filter.userId = userId;
    }
    
    const submissions = await Submission
      .find(filter)
      .sort({ submittedAt: -1 });
    
    // Transform submissions to match frontend expectations
    const transformedSubmissions = submissions.map(submission => {
      const submissionObj = submission.toObject();
      return {
        ...submissionObj,
        id: submissionObj._id.toString(),
        _id: undefined
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedSubmissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      assignmentId,
      userId,
      userName,
      userEmail,
      userAvatar,
      notes,
      attachments,
      dueDate
    } = body;
    
    // Validation
    if (!assignmentId || !userId || !userName || !userEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }
    
    // Check if user already submitted
    const existingSubmission = await Submission.findOne({ assignmentId, userId });
    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'Submission already exists for this user' },
        { status: 409 }
      );
    }
    
    // Determine status based on due date
    const submissionTime = new Date();
    const assignmentDueDate = new Date(dueDate || assignment.dueDate);
    const isLate = submissionTime > assignmentDueDate;
    
    const submission = new Submission({
      assignmentId,
      userId,
      userName,
      userEmail,
      userAvatar,
      notes: notes || '',
      attachments: attachments || [],
      status: isLate ? 'late' : 'submitted',
      submittedAt: submissionTime,
    });
    
    const savedSubmission = await submission.save();
    
    // Update assignment submission count
    await Assignment.findByIdAndUpdate(assignmentId, {
      $inc: { submissions: 1 }
    });
    
    // Transform submission to match frontend expectations
    const submissionObj = savedSubmission.toObject();
    const transformedSubmission = {
      ...submissionObj,
      id: submissionObj._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json({
      success: true,
      data: transformedSubmission
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create submission' },
      { status: 500 }
    );
  }
} 