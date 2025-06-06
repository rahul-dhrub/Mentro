import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Bunny.net configuration
const BUNNY_STORAGE_ENDPOINT = process.env.BUNNY_BASE_URL || 'https://la.storage.bunnycdn.com';
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || '';
const BUNNY_PULL_ZONE = process.env.BUNNY_PULL_ZONE || '';
const BUNNY_API_KEY = process.env.BUNNY_STORAGE_API_KEY || '';

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

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only image files (JPEG, PNG, WebP, GIF) are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate a unique filename with proper folder structure
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `publications/thumbnails/${userId}_${timestamp}_${random}.${fileExtension}`;
    const uploadUrl = `${BUNNY_STORAGE_ENDPOINT}/${BUNNY_STORAGE_ZONE}/${uniqueFilename}`;
    
    // Convert file to arrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to bunny.net
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': file.type,
      },
      body: buffer,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bunny.net upload failed:', errorText);
      return NextResponse.json(
        { error: `Upload failed: ${response.status} - ${response.statusText}` }, 
        { status: response.status }
      );
    }
    
    // Return success with the CDN URL
    const thumbnailUrl = `https://${BUNNY_PULL_ZONE}.b-cdn.net/${uniqueFilename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: thumbnailUrl,
      filename: uniqueFilename
    });
    
  } catch (error) {
    console.error('Error in publication thumbnail upload route:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' }, 
      { status: 500 }
    );
  }
} 