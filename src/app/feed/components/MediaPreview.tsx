'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiPlay, FiFileText, FiFile, FiDownload } from 'react-icons/fi';
import { Media } from '../types';
import ImageModal from './ImageModal';
import { VIDEO_PLACEHOLDER } from '../constants/media';

interface MediaPreviewProps {
  media: Media;
}

export default function MediaPreview({ media }: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const getVideoThumbnail = (url: string | undefined): string => {
    // If no URL provided, return placeholder
    if (!url) return VIDEO_PLACEHOLDER;
    
    // If we have a direct thumbnail URL, use it
    if (media.thumbnail) return media.thumbnail;
    
    // For Bunny.net videos, construct the thumbnail URL
    if (url.includes('iframe.mediadelivery.net')) {
      const videoId = url.split('/').pop()?.split('?')[0];
      return `https://vz-${videoId?.split('-')[0]}.b-cdn.net/${videoId}/preview.jpg`;
    }
    
    // Default fallback thumbnail
    return VIDEO_PLACEHOLDER;
  };

  const renderMediaContent = () => {
    switch (media.type) {
      case 'image':
        if (!media.url) return null;
        return (
          <>
            <div 
              className="relative w-full h-64 cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            >
              <Image
                src={media.url}
                alt={media.title || 'Image'}
                fill
                className="object-cover rounded-lg hover:opacity-95 transition-opacity"
              />
            </div>
            <ImageModal
              isOpen={isImageModalOpen}
              onClose={() => setIsImageModalOpen(false)}
              imageUrl={media.url}
              imageTitle={media.title || 'Image'}
            />
          </>
        );

      case 'video':
        if (!media.url) return null;
        return (
          <div className="relative w-full h-64">
            {isPlaying ? (
              <div className="relative w-full h-full">
                <iframe
                  src={media.url}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                />
              </div>
            ) : (
              <div className="relative w-full h-full bg-gray-100 rounded-lg">
                {!thumbnailError && (
                  <Image
                    src={getVideoThumbnail(media.url)}
                    alt={media.title || 'Video thumbnail'}
                    fill
                    className="object-cover rounded-lg"
                    onError={() => setThumbnailError(true)}
                  />
                )}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-opacity rounded-lg group"
                >
                  <div className="w-16 h-16 flex items-center justify-center bg-white/90 rounded-full group-hover:bg-white transition-all">
                    <FiPlay size={32} className="text-blue-600 ml-1" />
                  </div>
                </button>
                {media.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-sm">
                    {media.duration}
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'pdf':
      case 'document':
        if (!media.url) return null;
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