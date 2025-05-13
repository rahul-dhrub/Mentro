'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiPlay, FiFileText, FiFile, FiDownload } from 'react-icons/fi';
import { Media } from '../types';

interface MediaPreviewProps {
  media: Media;
}

export default function MediaPreview({ media }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const renderMediaContent = () => {
    switch (media.type) {
      case 'image':
        return (
          <div className="relative w-full h-64">
            <Image
              src={media.url}
              alt={media.title || 'Image'}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        );

      case 'video':
        return (
          <div className="relative w-full h-64">
            {isPlaying ? (
              <video
                src={media.url}
                controls
                autoPlay
                className="w-full h-full object-cover rounded-lg"
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={media.thumbnail || media.url}
                  alt={media.title || 'Video thumbnail'}
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-opacity rounded-lg"
                >
                  <FiPlay size={48} className="text-white" />
                </button>
                {media.duration && (
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {media.duration}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'pdf':
      case 'document':
        return (
          <a
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0">
              {media.type === 'pdf' ? (
                <FiFileText size={32} className="text-red-500" />
              ) : (
                <FiFile size={32} className="text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium truncate">
                {media.title || 'Document'}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{media.size || 'Unknown size'}</span>
                {media.pageCount && (
                  <>
                    <span>•</span>
                    <span>{media.pageCount} pages</span>
                  </>
                )}
              </div>
            </div>
            <FiDownload size={20} className="text-gray-400" />
          </a>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderMediaContent()}
    </div>
  );
} 