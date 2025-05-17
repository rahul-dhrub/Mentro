import { NextRequest, NextResponse } from 'next/server';

// Bunny.net Storage credentials - in production, these should be environment variables
const BUNNY_STORAGE_API_KEY = process.env.BUNNY_STORAGE_API_KEY || 'your-storage-api-key';
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || 'your-storage-zone';
const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || ''; // Optional, leave blank for default region
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD || ''; // Optional for FTP/SFTP access

// Base URL for Bunny Storage API
const STORAGE_API_BASE = 'https://storage.bunnycdn.com';
// Pull zone for serving files (customize based on your Bunny.net setup)
const PULL_ZONE_URL = `https://${process.env.BUNNY_PULL_ZONE}.b-cdn.net` || `https://${BUNNY_STORAGE_ZONE}.b-cdn.net`;

/**
 * Generates a unique path for a file based on file type and name
 */
function generateFilePath(fileType: string, fileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const safeName = fileName.replace(/[^a-zA-Z0-9_.]/g, '-');
  
  // Organize files by type
  const typeFolder = fileType === 'application/pdf' ? 'documents' : 'images';
  
  return `${typeFolder}/${timestamp}-${randomString}-${safeName}`;
}

/**
 * Gets storage upload URL and credentials
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { fileName, fileType, fileSize } = data;
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'File name and type are required' },
        { status: 400 }
      );
    }
    
    console.log(`Preparing Bunny.net storage upload for: ${fileName} (${fileType})`);
    
    // Generate a unique storage path
    const storagePath = generateFilePath(fileType, fileName);
    
    // Return upload information to the client
    return NextResponse.json({
      uploadUrl: `${STORAGE_API_BASE}/${BUNNY_STORAGE_ZONE}/${storagePath}`,
      downloadUrl: `${PULL_ZONE_URL}/${storagePath}`,
      headers: {
        'AccessKey': BUNNY_STORAGE_API_KEY,
        'Content-Type': fileType
      },
      httpMethod: 'PUT',
      storagePath
    });
  } catch (error) {
    console.error('Bunny.net storage API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Gets list of files or information about a specific file
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  
  try {
    let endpoint = `${STORAGE_API_BASE}/${BUNNY_STORAGE_ZONE}`;
    
    if (path) {
      endpoint += `/${path}`;
    }
    
    const response = await fetch(endpoint, {
      headers: {
        'AccessKey': BUNNY_STORAGE_API_KEY
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Bunny Storage API error: ${errorText}` },
        { status: response.status }
      );
    }
    
    // For a directory, this will be a list of files
    // For a specific file, this will be file information
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching from Bunny.net storage:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve storage information' },
      { status: 500 }
    );
  }
}

/**
 * Deletes a file from storage
 */
export async function DELETE(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path');
  
  if (!path) {
    return NextResponse.json(
      { error: 'File path is required' },
      { status: 400 }
    );
  }
  
  try {
    const response = await fetch(`${STORAGE_API_BASE}/${BUNNY_STORAGE_ZONE}/${path}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': BUNNY_STORAGE_API_KEY
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to delete file: ${errorText}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting from Bunny.net storage:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 