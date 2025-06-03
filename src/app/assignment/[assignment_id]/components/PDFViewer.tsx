import React, { useState } from 'react';
import { FiFile, FiRefreshCw, FiExternalLink, FiDownload } from 'react-icons/fi';

interface PDFViewerProps {
  src: string;
  title?: string;
  width?: string;
  height?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  src, 
  title = "PDF Viewer",
  width = "100%",
  height = "100%"
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
    <div className="pdf-viewer-container w-full h-full">
      <div className="relative w-full h-full">
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

export default PDFViewer; 