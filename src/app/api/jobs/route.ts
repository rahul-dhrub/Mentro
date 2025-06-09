import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/lib/db';
import Job from '@/models/Job';
import User from '@/models/User';

// GET /api/jobs - Fetch jobs with filtering and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const workType = searchParams.get('workType') || '';
    const employmentType = searchParams.get('employmentType') || '';
    const salaryMin = parseInt(searchParams.get('salaryMin') || '0');
    const salaryMax = parseInt(searchParams.get('salaryMax') || '999999');

    await connectDB();

    // Build query
    const query: any = { status: 'active' };

    // Search in title, description, and company
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category) {
      query.categories = { $in: [category] };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by work type
    if (workType) {
      query.workType = workType;
    }

    // Filter by employment type
    if (employmentType) {
      query.employmentType = employmentType;
    }

    // Filter by salary range
    if (salaryMin > 0 || salaryMax < 999999) {
      query.$or = [
        { 'salaryRange.min': { $gte: salaryMin, $lte: salaryMax } },
        { 'salaryRange.max': { $gte: salaryMin, $lte: salaryMax } },
        { 'salaryRange.min': { $lte: salaryMin }, 'salaryRange.max': { $gte: salaryMax } }
      ];
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const jobs = await Job.find(query)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('-applications') // Don't include applications array in listing
      .lean();

    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      jobs,
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
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job posting
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
      title,
      company,
      location,
      workType,
      employmentType,
      description,
      requirements,
      responsibilities,
      salaryRange,
      categories,
      skills,
      experience,
      easyApply,
      externalLink,
      customQuestions,
      deadline,
    } = body;

    // Validate required fields
    if (!title || !company || !location || !workType || !employmentType || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate easy apply settings
    if (!easyApply && !externalLink) {
      return NextResponse.json(
        { error: 'External link is required when easy apply is disabled' },
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

    // Create job
    const job = new Job({
      title,
      company,
      location,
      workType,
      employmentType,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      salaryRange: salaryRange || { min: 0, max: 0, currency: 'USD' },
      categories: categories || [],
      skills: skills || [],
      experience: experience || { min: 0, max: 10 },
      easyApply,
      externalLink,
      customQuestions: customQuestions || [],
      deadline: deadline ? new Date(deadline) : undefined,
      recruiterId: user._id,
      recruiterName: user.name,
      recruiterEmail: user.email,
    });

    await job.save();

    return NextResponse.json({
      message: 'Job posted successfully',
      job: {
        id: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        postedDate: job.postedDate,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 