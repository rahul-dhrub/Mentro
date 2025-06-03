import React from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';
import VideoPlayer from './VideoPlayer';
import PDFViewer from './PDFViewer';

interface QuizContent {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'image' | 'pdf' | 'link';
  order: number;
}

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: QuizContent | null;
  renderContentIcon: (type: string) => React.JSX.Element;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  onClose,
  content,
  renderContentIcon
}) => {
  if (!isOpen || !content) return null;

  const renderMediaPreview = () => {
    switch (content.type) {
      case 'video':
        return (
          <div className="w-full h-full">
            <VideoPlayer 
              src={content.url}
              title={content.title}
              height="100%"
            />
          </div>
        );
      
      case 'image':
        return (
          <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={content.url}
              alt={content.title}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-center text-gray-600';
                errorDiv.innerHTML = `
                  <div class="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <p>Unable to load image</p>
                  <a href="${content.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline mt-2 inline-block">Open in New Tab</a>
                `;
                e.currentTarget.parentNode?.appendChild(errorDiv);
              }}
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="w-full h-full">
            <PDFViewer 
              src={content.url}
              title={content.title}
              height="100%"
            />
          </div>
        );
      
      case 'link':
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiExternalLink className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.title}</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Click the button below to visit this external link
              </p>
              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-lg font-medium"
              >
                <FiExternalLink className="w-5 h-5" />
                <span>Visit Link</span>
              </a>
              <p className="text-xs text-gray-500 mt-4 break-all max-w-md mx-auto">
                {content.url}
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-gray-600">Content type not supported</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {renderContentIcon(content.type)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {content.title}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {content.type}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded"
            >
              <FiExternalLink size={16} />
              <span className="text-sm">Open in New Tab</span>
            </a>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-hidden" style={{ minHeight: '400px' }}>
          {renderMediaPreview()}
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal; 