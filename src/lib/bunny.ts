interface BunnyConfig {
  storageZone: string;
  storageApiKey: string;
  baseUrl: string;
  streamLibrary: string;
  streamApiKey: string;
}

class BunnyClient {
  private config: BunnyConfig;

  constructor() {
    this.config = {
      storageZone: process.env.BUNNY_STORAGE_ZONE || '',
      storageApiKey: process.env.BUNNY_STORAGE_API_KEY || '',
      baseUrl: process.env.BUNNY_BASE_URL || 'https://storage.bunnycdn.com',
      streamLibrary: process.env.BUNNY_STREAM_LIBRARY || '',
      streamApiKey: process.env.BUNNY_STREAM_API_KEY || ''
    };

    // Log configuration (without API key)
    console.log('Bunny.net Configuration:', {
      storageZone: this.config.storageZone,
      baseUrl: this.config.baseUrl,
      streamLibrary: this.config.streamLibrary,
      hasStorageApiKey: this.config.storageApiKey,
      hasStreamApiKey: this.config.streamApiKey
    });
  }

  private getFileExtension(fileName: string): string {
    const ext = fileName.split('.').pop();
    return ext ? `.${ext}` : '';
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const ext = this.getFileExtension(originalName);
    return `${timestamp}-${random}${ext}`;
  }

  async uploadToStorage(file: Buffer, fileName: string, folder: string = ''): Promise<string> {
    const uniqueFileName = this.generateUniqueFileName(fileName);
    const path = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;
    const url = `https://storage.bunnycdn.com/${this.config.storageZone}/${path}`;

    try {
      console.log('Attempting to upload to:', url);
      console.log('Storage Zone:', this.config.storageZone);
      console.log('File name:', uniqueFileName);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'AccessKey': this.config.storageApiKey,
          'Content-Type': 'application/octet-stream',
          'accept': 'application/json'
        },
        body: file,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        console.error('Error response:', errorText);
        console.error('Request URL:', url);
        console.error('Request headers:', {
          'AccessKey': '[HIDDEN]',
          'Content-Type': 'application/octet-stream',
          'accept': 'application/json'
        });
        throw new Error(`Upload failed: ${response.status} - ${errorText || response.statusText}`);
      }else{
        console.log('Upload successful');
      }

      // Return the CDN URL for the uploaded file
      return `https://${this.config.storageZone}.b-cdn.net/${path}`;
    } catch (error) {
      console.error('Error uploading to Bunny.net storage:', error);
      throw error;
    }
  }

  async uploadToStream(videoBuffer: Buffer, fileName: string): Promise<string> {
    try {
      console.log('Creating video object in stream library:', this.config.streamLibrary);
      
      // For stream API, we use the video API endpoint
      const createResponse = await fetch(`https://video.bunnycdn.com/library/${this.config.streamLibrary}/videos`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // For stream API, we use Authorization Bearer
          'AccessKey': `${this.config.streamApiKey}`
        },
        body: JSON.stringify({ title: fileName })
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Failed to create video object:', errorText);
        throw new Error(`Failed to create video object: ${createResponse.status} - ${errorText}`);
      }

      const { guid } = await createResponse.json();
      console.log('Video object created with GUID:', guid);

      // Then upload the video content
      const uploadResponse = await fetch(
        `https://video.bunnycdn.com/library/${this.config.streamLibrary}/videos/${guid}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'AccessKey': `${this.config.streamApiKey}`
          },
          body: videoBuffer
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Failed to upload video content:', errorText);
        throw new Error(`Failed to upload video content: ${uploadResponse.status} - ${errorText}`);
      }

      return `https://iframe.mediadelivery.net/embed/${this.config.streamLibrary}/${guid}`;
    } catch (error) {
      console.error('Error uploading to Bunny.net stream:', error);
      throw error;
    }
  }
}

export const bunnyClient = new BunnyClient(); 