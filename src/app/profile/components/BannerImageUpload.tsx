'use client';

import Image from 'next/image';
import { FiCamera, FiUpload } from 'react-icons/fi';

interface BannerImageUploadProps {
  bannerImage: string;
  isUploading: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BannerImageUpload({ 
  bannerImage, 
  isUploading, 
  onImageUpload 
}: BannerImageUploadProps) {
  return (
    <div className="relative h-80 w-full overflow-hidden group">
      <Image
        src={bannerImage}
        alt="Profile banner"
        fill
        className="object-cover"
        priority
      />
      
      {/* Upload Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
        <label htmlFor="banner-image-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
          <div className="flex flex-col items-center text-white">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                <p className="text-lg font-medium mb-2">Uploading Banner...</p>
                <p className="text-sm text-gray-200">Please wait while we upload your banner image</p>
              </>
            ) : (
              <>
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mb-4">
                  <FiCamera size={32} />
                </div>
                <p className="text-lg font-medium mb-2">Change Banner</p>
                <p className="text-sm text-gray-200 text-center max-w-xs">
                  Click to upload a new banner image (recommended: 1200x400px)
                </p>
                <div className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <FiUpload size={16} />
                  <span className="text-sm font-medium">Select Banner</span>
                </div>
              </>
            )}
          </div>
        </label>
      </div>
      
      {/* Hidden File Input */}
      <input
        id="banner-image-upload"
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
} 