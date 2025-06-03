import React from 'react';
import { FiPlay, FiImage, FiFile, FiLink } from 'react-icons/fi';

interface AttachmentIconProps {
  type: string;
  size?: number;
}

const AttachmentIcon: React.FC<AttachmentIconProps> = ({ type, size = 20 }) => {
  switch (type) {
    case 'video':
      return <FiPlay className="text-red-500" size={size} />;
    case 'image':
      return <FiImage className="text-green-500" size={size} />;
    case 'pdf':
      return <FiFile className="text-blue-500" size={size} />;
    case 'document':
      return <FiFile className="text-orange-500" size={size} />;
    case 'link':
      return <FiLink className="text-purple-500" size={size} />;
    default:
      // Fallback: check if type contains video-like patterns
      if (type && (type.includes('video') || type.includes('mp4') || type.includes('mov') || type.includes('avi'))) {
        return <FiPlay className="text-red-500" size={size} />;
      }
      return <FiFile className="text-gray-400" size={size} />;
  }
};

export default AttachmentIcon; 