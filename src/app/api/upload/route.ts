import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Bunny.net configuration - store these in environment variables in production
const BUNNY_STORAGE_ENDPOINT = process.env.BUNNY_BASE_URL || 'https://la.storage.bunnycdn.com';
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || '';
const BUNNY_PULL_ZONE = process.env.BUNNY_PULL_ZONE || '';
const BUNNY_API_KEY = process.env.BUNNY_STORAGE_API_KEY || ''; // Replace with actual API key in .env

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const uniqueFilename = `course_${timestamp}_${file.name.replace(/\s+/g, '_')}`;
    const uploadUrl = `${BUNNY_STORAGE_ENDPOINT}/${BUNNY_STORAGE_ZONE}/${uniqueFilename}`;
    
    // Convert file to arrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to bunny.net
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });
    
    if (!response.ok) {
      console.error('Bunny.net upload failed:', await response.text());
      return NextResponse.json(
        { error: `Upload failed with status: ${response.status}` }, 
        { status: response.status }
      );
    }
    
    // Return success with the CDN URL
    const imageUrl = `https://${BUNNY_PULL_ZONE}.b-cdn.net/${uniqueFilename}`;
    return NextResponse.json({ success: true, url: imageUrl });
    
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' }, 
      { status: 500 }
    );
  }
} 