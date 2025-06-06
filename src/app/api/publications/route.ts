import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../lib/db';
import Publication from '../../../models/Publication';
import User from '../../../models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get publications for the user
    const publications = await Publication.find({ userId: user._id })
      .sort({ createdAt: -1 });

    // Convert to the format expected by the frontend
    const formattedPublications = publications.map(pub => ({
      id: pub._id.toString(),
      title: pub.title,
      url: pub.url,
      thumbnail: pub.thumbnail,
      journal: pub.journal,
      year: pub.year,
      authors: pub.authors,
      citationCount: pub.citationCount,
      abstract: pub.abstract,
    }));

    return NextResponse.json({
      success: true,
      publications: formattedPublications,
    });

  } catch (error) {
    console.error('Error fetching publications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    let { title, url, journal, year, authors, citationCount, abstract, thumbnail } = body;

    // Validate required fields
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    // Normalize URL - add https:// if no protocol is specified
    if (url && !url.match(/^https?:\/\//i)) {
      url = `https://${url}`;
    }

    // Create new publication
    const publication = new Publication({
      title,
      url,
      journal,
      year,
      authors: authors || [],
      citationCount: citationCount || 0,
      abstract,
      thumbnail,
      userId: user._id,
    });

    const savedPublication = await publication.save();

    // Convert to the format expected by the frontend
    const formattedPublication = {
      id: savedPublication._id.toString(),
      title: savedPublication.title,
      url: savedPublication.url,
      thumbnail: savedPublication.thumbnail,
      journal: savedPublication.journal,
      year: savedPublication.year,
      authors: savedPublication.authors,
      citationCount: savedPublication.citationCount,
      abstract: savedPublication.abstract,
    };

    return NextResponse.json({
      success: true,
      publication: formattedPublication,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating publication:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 