import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get jobs posted by this user using recruiterEmail to handle Clerk ID mismatch
    const jobs = await Job.find({ 
      recruiterEmail: user.emailAddresses[0]?.emailAddress?.toLowerCase()
    }).sort({ createdAt: -1 });

    // For each job, get the count of applications
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ 
          jobId: job._id 
        });
        
        return {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          workType: job.workType,
          employmentType: job.employmentType,
          description: job.description,
          status: job.status,
          totalApplications: applicationCount,
          postedDate: job.createdAt,
          deadline: job.deadline,
          easyApply: job.easyApply,
          externalLink: job.externalLink,
          salaryRange: job.salaryRange
        };
      })
    );

    return NextResponse.json({
      success: true,
      jobs: jobsWithCounts
    });

  } catch (error) {
    console.error('Error fetching user jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
} 