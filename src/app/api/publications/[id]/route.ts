import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import connectDB from '../../../../lib/db';
import Publication from '../../../../models/Publication';
import User from '../../../../models/User';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid publication ID format' },
        { status: 400 }
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

    // Find and update publication (only if it belongs to the user)
    const publication = await Publication.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        title,
        url,
        journal,
        year,
        authors: authors || [],
        citationCount: citationCount || 0,
        abstract,
        thumbnail,
      },
      { new: true, runValidators: true }
    );

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found or unauthorized' },
        { status: 404 }
      );
    }

    // Convert to the format expected by the frontend
    const formattedPublication = {
      id: publication._id.toString(),
      title: publication.title,
      url: publication.url,
      thumbnail: publication.thumbnail,
      journal: publication.journal,
      year: publication.year,
      authors: publication.authors,
      citationCount: publication.citationCount,
      abstract: publication.abstract,
    };

    return NextResponse.json({
      success: true,
      publication: formattedPublication,
    });

  } catch (error) {
    console.error('Error updating publication:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid publication ID format' },
        { status: 400 }
      );
    }

    // Find and delete publication (only if it belongs to the user)
    const publication = await Publication.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!publication) {
      return NextResponse.json(
        { error: 'Publication not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Publication deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 