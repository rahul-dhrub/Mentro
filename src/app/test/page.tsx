'use client';

import React, { useState } from 'react';
import { FiPlay, FiFile, FiDownload, FiExternalLink, FiRefreshCw, FiMaximize } from 'react-icons/fi';

interface VideoPlayerProps {
  src: string;
  title?: string;
  width?: string;
  height?: string;
}

interface PDFViewerProps {
  src: string;
  title?: string;
  width?: string;
  height?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  title = "Video Player",
  width = "100%",
  height = "500px"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="video-player-container">
      <div className="relative w-full" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-sm">Loading video...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load video</p>
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mr-2"
                >
                  Retry
                </button>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </a>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={src}
          title={title}
          width={width}
          height={height}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full rounded-lg shadow-lg transition-opacity duration-300 ${
            isLoading || hasError ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    </div>
  );
};

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  src, 
  title = "PDF Viewer",
  width = "100%",
  height = "600px"
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const refreshPDF = () => {
    setHasError(false);
    setIsLoading(true);
  };

  return (
    <div className="pdf-viewer-container">
      <div className="relative w-full" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 text-sm">Loading PDF document...</p>
            </div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <FiFile className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">Failed to load PDF document</p>
              <div className="space-y-2">
                <button 
                  onClick={refreshPDF}
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors mr-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Retry</span>
                </button>
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2"
                >
                  <FiExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </a>
                <a
                  href={src}
                  download
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download PDF</span>
                </a>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md mx-auto">
                <p className="text-xs text-yellow-600">
                  <strong>Note:</strong> Some browsers may block PDF display. Try downloading or opening in a new tab.
                </p>
              </div>
            </div>
          </div>
        )}

        <iframe
          src={src}
          title={title}
          width={width}
          height={height}
          frameBorder="0"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full rounded-lg shadow-lg transition-opacity duration-300 ${
            isLoading || hasError ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>
    </div>
  );
};

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'pdf'>('video');
  
  const videoUrl = "https://iframe.mediadelivery.net/embed/424950/0612db34-fd6b-45d3-bd45-8f4bc6dcd4a7";
  const pdfUrl = "https://mentro45.b-cdn.net/documents/1748864667824-wv19ntawvr-application.pdf";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Media Player & Document Viewer
          </h1>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'video'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiPlay className="w-4 h-4" />
                <span>Video Player</span>
              </button>
              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
                  activeTab === 'pdf'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <FiFile className="w-4 h-4" />
                <span>PDF Viewer</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="mb-4">
            {activeTab === 'video' ? (
              <VideoPlayer 
                src={videoUrl}
                title="Embedded Video Player"
                height="600px"
              />
            ) : (
              <PDFViewer 
                src={pdfUrl}
                title="PDF Document Viewer"
                height="700px"
              />
            )}
          </div>
          
          {/* Details Section */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {activeTab === 'video' ? 'Video Details' : 'Document Details'}
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600 text-sm break-all">
                <strong>Source:</strong> {activeTab === 'video' ? videoUrl : pdfUrl}
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Type:</strong> {activeTab === 'video' ? 'Video (iframe embed)' : 'PDF Document'}
              </p>
              {activeTab === 'pdf' && (
                <p className="text-gray-600 text-sm">
                  <strong>Features:</strong> View, Download, Print (browser dependent)
                </p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh Page</span>
            </button>
            
            {activeTab === 'pdf' && (
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
            )}
            
            <button 
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  document.documentElement.requestFullscreen();
                }
              }}
              className="inline-flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FiMaximize className="w-4 h-4" />
              <span>Toggle Fullscreen</span>
            </button>
          </div>

          {/* Usage Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Usage Tips:</h3>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Use the tabs above to switch between video and PDF content</li>
              <li>• Videos support fullscreen mode and various playback controls</li>
              <li>• PDFs can be viewed directly in browser, downloaded, or opened in new tab</li>
              <li>• All content is responsive and works on desktop and mobile devices</li>
              {activeTab === 'pdf' && (
                <li>• Use browser's PDF controls (zoom, search, navigation) when viewing</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
