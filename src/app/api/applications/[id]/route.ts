import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';

// GET /api/applications/[id] - Get application details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const application = await Application.findById(params.id)
      .populate('jobId', 'title company location recruiterId')
      .populate('applicantId', 'name email profilePicture');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this application
    // Either the applicant themselves or the recruiter who posted the job
    const isApplicant = application.applicantId._id.equals(user._id);
    const isRecruiter = application.jobId.recruiterId.equals(user._id);

    if (!isApplicant && !isRecruiter) {
      return NextResponse.json(
        { error: 'Unauthorized to view this application' },
        { status: 403 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/applications/[id] - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
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

    const application = await Application.findById(params.id)
      .populate('jobId', 'recruiterId');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Only the recruiter who posted the job can update application status
    if (!application.jobId.recruiterId.equals(user._id)) {
      return NextResponse.json(
        { error: 'Unauthorized to update this application' },
        { status: 403 }
      );
    }

    // Update application status
    await application.updateStatus(status, user._id, notes);

    return NextResponse.json({
      message: 'Application status updated successfully',
      application: {
        _id: application._id,
        status: application.status,
        reviewedBy: application.reviewedBy,
        reviewedAt: application.reviewedAt,
        notes: application.notes
      }
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id] - Delete application (only by applicant)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const application = await Application.findById(params.id)
      .populate('jobId', 'recruiterId');

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Only the applicant can delete their own application
    if (!application.applicantId.equals(user._id)) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this application' },
        { status: 403 }
      );
    }

    // Remove application from job's applications array
    const job = await Job.findById(application.jobId._id);
    if (job) {
      await job.removeApplication(application._id);
    }

    // Delete the application
    await Application.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 