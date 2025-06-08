'use client';

import Image from 'next/image';
import { FiCamera } from 'react-icons/fi';

interface ProfileImageUploadProps {
  profileImage: string;
  userName: string;
  isUploading: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileImageUpload({ 
  profileImage, 
  userName, 
  isUploading, 
  onImageUpload 
}: ProfileImageUploadProps) {
  return (
    <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-200 shadow-lg flex-shrink-0 group">
      <Image
        src={profileImage}
        alt={userName}
        fill
        className="object-cover"
        priority
      />
      
      {/* Upload Overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <label htmlFor="profile-image-upload" className={`cursor-pointer ${isUploading ? 'pointer-events-none' : ''}`}>
          <div className="flex flex-col items-center text-white">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <>
                <FiCamera size={24} />
                <span className="text-xs mt-1">Change Photo</span>
              </>
            )}
          </div>
        </label>
      </div>
      
      {/* Hidden File Input */}
      <input
        id="profile-image-upload"
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
} 