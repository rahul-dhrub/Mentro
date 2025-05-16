import { NextRequest, NextResponse } from 'next/server';
import { generateVideoThumbnail } from '@/app/feed/utils/videoThumbnail';
import { SUPPORTED_VIDEO_TYPES, MAX_FILE_SIZE } from '@/app/feed/constants/media';
import { uploadVideoToBunnyStream, uploadToBunnyStorage } from '@/app/feed/utils/bunnyStorage';
import { readFile, unlink } from 'fs/promises';

export async function POST(request: NextRequest) {
  let thumbnailPath: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only video files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate thumbnail
    const thumbnail = await generateVideoThumbnail(buffer, file.name);
    thumbnailPath = thumbnail.thumbnailPath;

    // Upload video to Bunny.net Stream
    const videoUrl = await uploadVideoToBunnyStream(buffer, file.name);

    // Read the thumbnail file and upload to Bunny.net Storage
    const thumbnailBuffer = await readFile(thumbnailPath);
    const thumbnailUrl = await uploadToBunnyStorage(
      thumbnailBuffer,
      `${file.name}-thumbnail.jpg`,
      'image/jpeg'
    );

    return NextResponse.json({
      success: true,
      data: {
        videoUrl,
        thumbnailUrl,
        width: thumbnail.width,
        height: thumbnail.height
      }
    });

  } catch (error) {
    console.error('Error processing video upload:', error);
    return NextResponse.json(
      { error: 'Failed to process video upload' },
      { status: 500 }
    );
  } finally {
    // Clean up the thumbnail file
    if (thumbnailPath) {
      try {
        await unlink(thumbnailPath).catch(() => {});
      } catch (error) {
        console.error('Error cleaning up thumbnail:', error);
      }
    }
  }
}

// You'll need to implement these functions based on your storage solution
async function uploadToBunny(buffer: Buffer, fileName: string): Promise<string> {
  // Implement your Bunny.net upload logic here
  throw new Error('Not implemented');
}

async function uploadToStorage(filePath: string): Promise<string> {
  // Implement your storage upload logic here
  throw new Error('Not implemented');
} 