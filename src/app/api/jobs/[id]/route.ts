import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import User from '@/models/User';

// GET /api/jobs/[id] - Fetch single job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await connectDB();
    
    const job = await Job.findById(id).lean();
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Update job (only by recruiter)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    // Get user details
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find job and verify ownership
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (!job.recruiterId.equals(user._id)) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own jobs' },
        { status: 403 }
      );
    }

    // Update job
    Object.assign(job, body);
    await job.save();

    return NextResponse.json({
      message: 'Job updated successfully',
      job,
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update job status (only by recruiter)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !['active', 'closed', 'draft'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, closed, draft' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user details
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find job and verify ownership using recruiterEmail
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check ownership using email since recruiterId might be inconsistent
    if (job.recruiterEmail !== user.email) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own jobs' },
        { status: 403 }
      );
    }

    // Update job status
    job.status = status;
    await job.save();

    return NextResponse.json({
      message: `Job status updated to ${status}`,
      job,
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete job (only by recruiter)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    await connectDB();

    // Get user details
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find job and verify ownership
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check ownership using email since recruiterId might be inconsistent
    if (job.recruiterEmail !== user.email) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own jobs' },
        { status: 403 }
      );
    }

    // Actually delete the job document
    await Job.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 