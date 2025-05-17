/**
 * Utility functions for video uploads to Bunny.net
 */

/**
 * Initializes a video upload and gets credentials
 */
export async function initializeVideoUpload(title: string, filename: string) {
  try {
    const response = await fetch('/api/bunny-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, filename }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize upload');
    }

    return await response.json();
  } catch (error) {
    console.error('Initialize upload error:', error);
    throw error;
  }
}

/**
 * Uploads a video file directly to Bunny.net with chunking and retry capability
 */
export async function uploadVideoToBunny(
  file: File,
  uploadUrl: string,
  httpMethod: string,
  headers: Record<string, string>,
  onProgress?: (progress: number) => void
) {
  // Constants for chunked upload
  const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let uploadedChunks = 0;
  let overallProgress = 0;

  // Helper function to pause execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to report progress
  const updateProgress = (chunkProgress: number, chunkIndex: number) => {
    // Calculate overall progress considering current chunk
    const chunkContribution = (1 / totalChunks) * chunkProgress;
    const completedChunksContribution = (uploadedChunks / totalChunks) * 100;
    overallProgress = completedChunksContribution + chunkContribution;
    
    if (onProgress) {
      onProgress(Math.round(overallProgress));
    }
  };

  // Helper function to upload a chunk with retries
  const uploadChunk = async (
    chunk: Blob,
    startByte: number,
    endByte: number,
    attempt = 1
  ): Promise<void> => {
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise<void>((resolve, reject) => {
        // Set up progress tracking for this chunk
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const chunkProgress = (event.loaded / event.total) * 100;
            updateProgress(chunkProgress, uploadedChunks);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            uploadedChunks++;
            updateProgress(100, uploadedChunks);
            resolve();
          } else {
            const error = new Error(`Upload failed with status ${xhr.status}`);
            reject(error);
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });
        
        xhr.open(httpMethod, uploadUrl, true);
        
        // Set all required headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
        
        // Set content range header for chunked upload if multiple chunks
        if (totalChunks > 1) {
          xhr.setRequestHeader('Content-Range', `bytes ${startByte}-${endByte-1}/${file.size}`);
        }
        
        xhr.send(chunk);
      });
    } catch (error) {
      console.error(`Chunk upload failed (attempt ${attempt}):`, error);
      
      // Retry logic
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying chunk upload in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        return uploadChunk(chunk, startByte, endByte, attempt + 1);
      }
      
      throw error;
    }
  };

  try {
    // If file is small, upload in one request
    if (file.size <= CHUNK_SIZE) {
      await uploadChunk(file, 0, file.size);
      return;
    }
    
    // Otherwise, upload in chunks
    for (let i = 0; i < totalChunks; i++) {
      const startByte = i * CHUNK_SIZE;
      const endByte = Math.min(file.size, startByte + CHUNK_SIZE);
      const chunk = file.slice(startByte, endByte);
      
      await uploadChunk(chunk, startByte, endByte);
      
      // Small delay between chunks to avoid overwhelming the server
      if (i < totalChunks - 1) {
        await delay(100);
      }
    }
  } catch (error) {
    console.error('Fatal upload error:', error);
    
    // Try to delete the failed upload
    try {
      const guidMatch = uploadUrl.match(/videos\/([^\/]+)$/);
      if (guidMatch && guidMatch[1]) {
        const guid = guidMatch[1];
        await fetch(`/api/bunny-upload?guid=${guid}`, { method: 'DELETE' });
        console.log(`Deleted failed upload with GUID: ${guid}`);
      }
    } catch (deleteError) {
      console.error('Failed to clean up failed upload:', deleteError);
    }
    
    throw error;
  }
}

/**
 * Gets information about an uploaded video
 */
export async function getVideoInfo(guid: string) {
  try {
    const response = await fetch(`/api/bunny-upload?guid=${guid}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get video info');
    }

    return await response.json();
  } catch (error) {
    console.error('Get video info error:', error);
    throw error;
  }
}

/**
 * Waits for a video to be processed
 * @param guid The video GUID
 * @param maxAttempts Maximum number of attempts (default: 30)
 * @param interval Interval between attempts in ms (default: 2000)
 */
export async function waitForVideoProcessing(
  guid: string,
  maxAttempts = 30,
  interval = 2000
) {
  return new Promise<any>((resolve, reject) => {
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const videoInfo = await getVideoInfo(guid);
        
        // Check if video is ready
        if (videoInfo.status === 4) { // 4 = Ready in Bunny.net API
          resolve(videoInfo);
          return;
        }
        
        // If we've reached max attempts, resolve with current status
        if (++attempts >= maxAttempts) {
          resolve(videoInfo);
          return;
        }
        
        // Try again after interval
        setTimeout(checkStatus, interval);
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
} 