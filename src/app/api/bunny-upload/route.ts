import { NextRequest, NextResponse } from 'next/server';

// Bunny.net credentials - in production, these should be environment variables
const BUNNY_API_KEY = process.env.BUNNY_STREAM_API_KEY || 'your-bunny-api-key';
const BUNNY_LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY || 'your-library-id';
const BUNNY_COLLECTION_ID = process.env.BUNNY_COLLECTION_ID || ''; // Optional

/**
 * Initializes a video upload with Bunny.net and returns credentials for direct upload
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { title, filename } = data;
    
    if (!title || !filename) {
      return NextResponse.json(
        { error: 'Title and filename are required' },
        { status: 400 }
      );
    }

    console.log(`Creating video in Bunny.net with title: ${title}`);

    // Step 1: Create a video in Bunny Stream
    const createVideoResponse = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'AccessKey': BUNNY_API_KEY
        },
        body: JSON.stringify({
          title,
          collectionId: BUNNY_COLLECTION_ID || null
        })
      }
    );

    const responseText = await createVideoResponse.text();
    console.log('Bunny.net create video response:', responseText);

    if (!createVideoResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: `Invalid response from Bunny.net: ${responseText}` };
      }
      
      console.error('Bunny.net create video error:', errorData);
      return NextResponse.json(
        { error: 'Failed to initialize video upload' },
        { status: createVideoResponse.status }
      );
    }

    let videoData;
    try {
      videoData = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing create video response:', e);
      return NextResponse.json(
        { error: `Invalid JSON response from Bunny.net: ${responseText}` },
        { status: 500 }
      );
    }
    
    const { guid } = videoData;
    console.log(`Video created with GUID: ${guid}`);

    // Directly construct the upload URL based on Bunny.net documentation
    // This avoids an extra API call that might be failing
    const uploadUrl = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}`;
    const httpMethod = 'PUT';

    console.log(`Generated upload URL: ${uploadUrl}`);

    return NextResponse.json({
      guid,
      uploadUrl,
      httpMethod,
      libraryId: BUNNY_LIBRARY_ID,
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/octet-stream',
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    console.error('Bunny.net API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Gets information about a video from Bunny.net
 */
export async function GET(req: NextRequest) {
  const guid = req.nextUrl.searchParams.get('guid');
  
  if (!guid) {
    return NextResponse.json(
      { error: 'Video guid is required' },
      { status: 400 }
    );
  }

  console.log(`Fetching video info for GUID: ${guid}`);

  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}`,
      {
        headers: {
          'Accept': 'application/json',
          'AccessKey': BUNNY_API_KEY
        }
      }
    );

    const responseText = await response.text();
    console.log(`Bunny.net get video response for ${guid}:`, responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: `Invalid response from Bunny.net: ${responseText}` };
      }
      
      console.error('Bunny.net get video error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get video info' },
        { status: response.status }
      );
    }

    let videoData;
    try {
      videoData = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing video info response:', e);
      return NextResponse.json(
        { error: `Invalid JSON response from Bunny.net: ${responseText}` },
        { status: 500 }
      );
    }
    
    // Return only the necessary data to the client
    return NextResponse.json({
      guid: videoData.guid,
      title: videoData.title,
      status: videoData.status,
      availableResolutions: videoData.availableResolutions,
      thumbnailUrl: videoData.thumbnailUrl,
      // Streaming URL format depends on your setup
      streamingUrl: `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoData.guid}`,
      // Direct URL for download (if enabled in your Bunny.net settings)
      directUrl: videoData.hasMP4 ? `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoData.guid}/play_${videoData.guid}.mp4` : null
    });
  } catch (error) {
    console.error('Bunny.net API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Deletes a video from Bunny.net if the upload fails
 */
export async function DELETE(req: NextRequest) {
  const guid = req.nextUrl.searchParams.get('guid');
  
  if (!guid) {
    return NextResponse.json(
      { error: 'Video guid is required' },
      { status: 400 }
    );
  }

  console.log(`Deleting failed upload with GUID: ${guid}`);

  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos/${guid}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'AccessKey': BUNNY_API_KEY
        }
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Failed to delete video ${guid}:`, responseText);
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bunny.net delete video error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}