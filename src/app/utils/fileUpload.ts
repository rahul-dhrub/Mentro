/**
 * Utility functions for image and PDF uploads to Bunny.net storage
 */

/**
 * Interface for upload response
 */
export interface StorageUploadResponse {
  downloadUrl: string;
  storagePath: string;
  success: boolean;
}

/**
 * Initializes a file upload to Bunny.net storage
 */
export async function initializeStorageUpload(file: File): Promise<any> {
  try {
    const response = await fetch('/api/bunny-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize upload');
    }

    return await response.json();
  } catch (error) {
    console.error('Initialize storage upload error:', error);
    throw error;
  }
}

/**
 * Uploads a file to Bunny.net storage with retry capability
 */
export async function uploadFileToBunnyStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<StorageUploadResponse> {
  // Constants for upload settings
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  // Helper function to pause execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Upload attempt with retry logic
  const attemptUpload = async (attempt = 1): Promise<StorageUploadResponse> => {
    try {
      // Get upload credentials from server
      const { uploadUrl, downloadUrl, headers, httpMethod, storagePath } = await initializeStorageUpload(file);

      // Upload the file
      const uploadResult = await uploadWithProgress(file, uploadUrl, httpMethod, headers, onProgress);
      
      // Return successful result
      return {
        downloadUrl,
        storagePath,
        success: true
      };
    } catch (error: any) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      
      // Retry logic
      if (attempt < MAX_RETRIES) {
        console.log(`Retrying upload in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        return attemptUpload(attempt + 1);
      }
      
      throw error;
    }
  };

  return attemptUpload();
}

/**
 * Uploads a file with progress tracking
 */
function uploadWithProgress(
  file: File,
  uploadUrl: string,
  method: string,
  headers: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open(method, uploadUrl, true);
    
    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });
    
    xhr.send(file);
  });
}

/**
 * Deletes a file from Bunny.net storage
 */
export async function deleteFileFromStorage(storagePath: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/bunny-storage?path=${encodeURIComponent(storagePath)}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete file');
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Delete file error:', error);
    throw error;
  }
}

/**
 * Gets a list of files from a directory in storage
 */
export async function listFilesInStorage(directory?: string): Promise<any[]> {
  try {
    const path = directory ? `?path=${encodeURIComponent(directory)}` : '';
    const response = await fetch(`/api/bunny-storage${path}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to list files');
    }

    return await response.json();
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
} 