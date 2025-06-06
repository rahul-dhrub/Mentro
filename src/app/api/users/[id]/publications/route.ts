import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../../../lib/db';
import Publication from '../../../../../models/Publication';
import User from '../../../../../models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;

    // Find the user by their ID (could be clerkId or MongoDB _id)
    let user = await User.findOne({ clerkId: id });
    if (!user && mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id);
    }
    
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
    console.error('Error fetching user publications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 