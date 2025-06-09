import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Application from '@/models/Application';
import Job from '@/models/Job';
import User from '@/models/User';
import crypto from 'crypto';

interface CustomQuestion {
  _id: string;
  question: string;
  required: boolean;
  type: 'text' | 'textarea' | 'select' | 'multiselect';
  options: string[];
}

// POST /api/applications - Submit a job application
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      jobId,
      resumeUrl,
      coverLetter,
      mobileNumber,
      customAnswers,
    } = body;

    // Validate required fields
    if (!jobId || !resumeUrl) {
      return NextResponse.json(
        { error: 'Job ID and resume are required' },
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

    // Get job details
    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if job is still active
    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: user._id,
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 400 }
      );
    }

    // Validate custom answers for required questions
    const requiredQuestions = job.customQuestions.filter((q: CustomQuestion) => q.required);
    const answeredQuestions = customAnswers?.map((a: any) => a.questionId) || [];
    
    for (const question of requiredQuestions) {
      if (!answeredQuestions.includes(question._id.toString())) {
        return NextResponse.json(
          { error: `Please answer the required question: ${question.question}` },
          { status: 400 }
        );
      }
    }

    // Generate email confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Create application
    const application = new Application({
      jobId,
      applicantId: user._id,
      applicantName: user.name,
      applicantEmail: user.email,
      mobileNumber,
      resumeUrl,
      coverLetter,
      customAnswers: customAnswers || [],
      confirmationToken,
      confirmationSentAt: new Date(),
    });

    await application.save();

    // Add application to job
    await job.addApplication(application._id);

    // TODO: Send email confirmation
    // await sendApplicationConfirmationEmail(user.email, confirmationToken);

    return NextResponse.json({
      message: 'Application submitted successfully',
      applicationId: application._id,
      requiresEmailConfirmation: true,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/applications - Get user's applications or recruiter's received applications
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const type = searchParams.get('type'); // 'sent' for user's applications, 'received' for recruiter

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let query: any = {};
    let populateOptions: any = [];

    if (type === 'received') {
      // Recruiter viewing received applications
      if (jobId) {
        // Applications for a specific job
        const job = await Job.findById(jobId);
        if (!job || !job.recruiterId.equals(user._id)) {
          return NextResponse.json(
            { error: 'Job not found or unauthorized' },
            { status: 404 }
          );
        }
        query.jobId = jobId;
      } else {
        // All applications for recruiter's jobs
        const recruiterJobs = await Job.find({ recruiterId: user._id }).select('_id');
        query.jobId = { $in: recruiterJobs.map(job => job._id) };
      }
      populateOptions = [
        { path: 'jobId', select: 'title company location' },
        { path: 'applicantId', select: 'name profilePicture' }
      ];
    } else {
      // User viewing their own applications
      query.applicantId = user._id;
      populateOptions = [
        { path: 'jobId', select: 'title company location status' }
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const applications = await Application.find(query)
      .populate(populateOptions)
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Application.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 