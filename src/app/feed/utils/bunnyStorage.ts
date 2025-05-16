import { v4 as uuidv4 } from 'uuid';

const BUNNY_API_KEY = process.env.BUNNY_STORAGE_API_KEY!;
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE!;
const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || 'sg';

interface BunnyUploadResponse {
  HttpCode: number;
  Message: string;
  StatusCode: number;
  Guid: string;
}

export async function uploadToBunnyStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Generate a unique path for the file
  const uniqueFileName = `${uuidv4()}-${fileName}`;
  const endpoint = `https://${BUNNY_STORAGE_REGION}.storage.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${uniqueFileName}`;

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': contentType,
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to Bunny.net: ${response.statusText}`);
    }

    const data: BunnyUploadResponse = await response.json();

    if (data.StatusCode !== 200) {
      throw new Error(`Bunny.net upload failed: ${data.Message}`);
    }

    // Return the CDN URL
    return `https://${BUNNY_STORAGE_ZONE}.b-cdn.net/${uniqueFileName}`;
  } catch (error) {
    console.error('Error uploading to Bunny.net:', error);
    throw error;
  }
}

export async function uploadVideoToBunnyStream(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const BUNNY_STREAM_API_KEY = process.env.BUNNY_STREAM_API_KEY!;
  const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY!;
  const endpoint = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`;

  try {
    // Create video
    const createResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/*+json',
        'AccessKey': BUNNY_STREAM_API_KEY
      },
      body: JSON.stringify({ title: fileName })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create video: ${createResponse.statusText}`);
    }

    const videoData = await createResponse.json();
    const videoId = videoData.guid;

    // Upload video content
    const uploadResponse = await fetch(
      `${endpoint}/${videoId}`,
      {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'AccessKey': BUNNY_STREAM_API_KEY
        },
        body: buffer
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload video content: ${uploadResponse.statusText}`);
    }

    // Return the iframe URL
    return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}`;
  } catch (error) {
    console.error('Error uploading to Bunny Stream:', error);
    throw error;
  }
} 