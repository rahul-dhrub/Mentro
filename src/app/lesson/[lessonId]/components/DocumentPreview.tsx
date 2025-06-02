'use client';

import React, { useState, useEffect } from 'react';
import { FiMaximize2, FiMinimize2, FiDownload, FiExternalLink } from 'react-icons/fi';

interface DocumentPreviewProps {
  url: string;
  title: string;
  type: 'pdf' | 'document';
}

export default function DocumentPreview({ url, title, type }: DocumentPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Add timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
        // Don't set error=true here, just stop loading
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [loading]);

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // For non-PDF documents, try to render them in an iframe
  // For PDFs, use object/embed tags for better compatibility
  const renderDocument = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
          <div className="text-center">
            <FiExternalLink className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Unable to preview this document</p>
            <div className="space-y-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiExternalLink className="w-4 h-4" />
                <span>Open in New Tab</span>
              </a>
              <br />
              <a
                href={url}
                download
                className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (type === 'pdf') {
      return (
        <div className="relative h-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Loading PDF...</p>
                <p className="text-xs text-gray-500 mt-2">If this takes too long, try opening in a new tab</p>
              </div>
            </div>
          )}
          
          {/* Try iframe first for better compatibility */}
          <iframe
            src={`${url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full rounded-lg border-0"
            title={title}
            onLoad={handleLoad}
            onError={handleError}
            style={{ display: loading ? 'none' : 'block' }}
          />
          
          {/* Fallback to object/embed if iframe doesn't work */}
          <div style={{ display: 'none' }}>
            <object
              data={url}
              type="application/pdf"
              className="w-full h-full rounded-lg"
              onLoad={handleLoad}
              onError={handleError}
            >
              <embed
                src={url}
                type="application/pdf"
                className="w-full h-full rounded-lg"
                onLoad={handleLoad}
                onError={handleError}
              />
            </object>
          </div>
        </div>
      );
    }

    // For other document types, try iframe
    return (
      <div className="relative h-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Loading document...</p>
              <p className="text-xs text-gray-500 mt-2">If this takes too long, try opening in a new tab</p>
            </div>
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full rounded-lg border-0"
          onLoad={handleLoad}
          onError={handleError}
          title={title}
          style={{ display: loading ? 'none' : 'block' }}
        />
      </div>
    );
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative h-full'}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-t-lg">
        <h4 className="font-medium text-gray-900 truncate">{title}</h4>
        <div className="flex items-center space-x-2">
          <a
            href={url}
            download
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Download"
          >
            <FiDownload className="w-4 h-4" />
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title="Open in new tab"
          >
            <FiExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <FiMinimize2 className="w-4 h-4" />
            ) : (
              <FiMaximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Document Preview */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(100%-60px)]'}`}>
        {renderDocument()}
      </div>
    </div>
  );
} 