import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';

interface ThumbnailResult {
  thumbnailPath: string;
  width: number;
  height: number;
}

export async function generateVideoThumbnail(
  videoBuffer: Buffer,
  videoFileName: string
): Promise<ThumbnailResult> {
  // Create a temporary file path for the video
  const tempVideoPath = path.join(process.cwd(), 'tmp', `${uuidv4()}-${videoFileName}`);
  const tempThumbnailPath = path.join(process.cwd(), 'tmp', 'thumbnails', `${uuidv4()}-thumbnail.png`);
  
  try {
    // Write the video buffer to a temporary file
    await writeFile(tempVideoPath, videoBuffer);
    
    // Generate thumbnail using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .on('error', reject)
        .on('end', resolve)
        .screenshots({
          timestamps: ['1'], // Take screenshot at 1 second
          filename: path.basename(tempThumbnailPath),
          folder: path.dirname(tempThumbnailPath),
          size: '640x?', // Scale width to 640px, maintain aspect ratio
        });
    });

    // Read and optimize the thumbnail
    const thumbnail = await sharp(tempThumbnailPath)
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    // Get the image dimensions
    const metadata = await sharp(thumbnail).metadata();

    // Generate a unique filename for the thumbnail
    const thumbnailFileName = `${path.parse(videoFileName).name}-${uuidv4()}.jpg`;
    const finalThumbnailPath = path.join('thumbnails', thumbnailFileName);

    return {
      thumbnailPath: tempThumbnailPath, // Return the temporary path since we'll read it before upload
      width: metadata.width || 640,
      height: metadata.height || 360
    };
  } finally {
    // Clean up temporary files
    try {
      await Promise.all([
        unlink(tempVideoPath).catch(() => {}),
        // Don't delete the thumbnail yet as we need to upload it
      ]);
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }
  }
} 