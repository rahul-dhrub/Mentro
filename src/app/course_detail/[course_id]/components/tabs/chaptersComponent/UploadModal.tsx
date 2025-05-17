import React, { useState, useRef } from 'react';
import { FiX, FiVideo, FiAlertTriangle, FiCheck, FiClipboard, FiImage, FiFile } from 'react-icons/fi';
import { ContentType } from './types';
import { initializeVideoUpload, uploadVideoToBunny, waitForVideoProcessing } from '../../../../../utils/videoUpload';
import { uploadFileToBunnyStorage } from '../../../../../utils/fileUpload';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  onUploadSuccess: (url: string) => void;
}

export default function UploadModal({ isOpen, onClose, contentType, onUploadSuccess }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!isOpen) return null;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file types
      if (contentType === 'video' && !file.type.startsWith('video/')) {
        setUploadError('Please select a valid video file');
        return;
      } else if (contentType === 'image' && !file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file');
        return;
      } else if (contentType === 'pdf' && file.type !== 'application/pdf') {
        setUploadError('Please select a valid PDF file');
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
    }
  };
  
  const handleUploadContent = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // For non-video files (images and PDFs), use Bunny.net storage
      if (contentType === 'image' || contentType === 'pdf') {
        // Use the file upload utilities
        const result = await uploadFileToBunnyStorage(
          selectedFile,
          (progress: number) => setUploadProgress(progress)
        );
        
        // Set file info from the result
        setVideoInfo({
          url: result.downloadUrl,
          title: selectedFile.name,
          type: contentType,
          storagePath: result.storagePath
        });
        
        setIsUploading(false);
        return;
      }
      
      // If it's a link type, we shouldn't get here, but just in case
      if (contentType === 'link') {
        setUploadError('Links cannot be uploaded. Please enter a URL directly.');
        setIsUploading(false);
        return;
      }
      
      // For videos, use the existing Bunny.net streaming integration
      const title = selectedFile.name.replace(/\.[^/.]+$/, "");
      const { guid, uploadUrl, httpMethod, headers } = await initializeVideoUpload(
        title,
        selectedFile.name
      );
      
      await uploadVideoToBunny(
        selectedFile,
        uploadUrl,
        httpMethod,
        headers,
        (progress: number) => setUploadProgress(progress)
      );
      
      setIsUploading(false);
      setIsProcessing(true);
      
      const processedVideo = await waitForVideoProcessing(guid);
      setVideoInfo(processedVideo);
      
      setIsProcessing(false);
    } catch (error: any) {
      console.error('Error uploading content:', error);
      
      let errorMessage = 'Failed to upload content';
      if (error.message.includes('network')) {
        errorMessage = 'Network connection lost. Please try again with a stable connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again with a smaller file or better connection.';
      } else if (error.message.includes('aborted')) {
        errorMessage = 'Upload was aborted. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUploadError(errorMessage);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const closeModal = () => {
    onClose();
    setSelectedFile(null);
    setVideoInfo(null);
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(false);
    setIsProcessing(false);
    setCopied(false);
  };
  
  const useVideoUrl = () => {
    if (videoInfo?.streamingUrl) {
      onUploadSuccess(videoInfo.streamingUrl);
    } else if (videoInfo?.url) {
      onUploadSuccess(videoInfo.url);
    }
    closeModal();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Upload {contentType === 'video' ? 'Video' : 
                   contentType === 'image' ? 'Image' : 
                   'PDF Document'}
          </h3>
          <button 
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          {!videoInfo ? (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {contentType === 'video' && <FiVideo className="mx-auto text-gray-400 mb-3" size={36} />}
                {contentType === 'image' && <FiImage className="mx-auto text-gray-400 mb-3" size={36} />}
                {contentType === 'pdf' && <FiFile className="mx-auto text-gray-400 mb-3" size={36} />}
                
                <p className="text-sm text-gray-600 mb-2">
                  Select a {contentType} file to upload
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={
                    contentType === 'video' ? 'video/*' : 
                    contentType === 'image' ? 'image/*' : 
                    'application/pdf'
                  }
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                  disabled={isUploading || isProcessing}
                >
                  Browse Files
                </button>
              </div>
              
              {selectedFile && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
              
              {isUploading && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress}%
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Large files are uploaded in chunks. Please keep this window open.
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Network interruptions will be automatically handled.
                  </p>
                </div>
              )}
              
              {/* Processing message only needed for videos */}
              {isProcessing && contentType === 'video' && (
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="animate-pulse flex space-x-4 justify-center items-center">
                    <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                    <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                  </div>
                  <p className="text-blue-700 mt-2">
                    Processing video... This may take a few minutes.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Your upload was successful. Bunny.net is now processing your video.
                  </p>
                </div>
              )}
              
              {uploadError && (
                <div className="bg-red-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start">
                    <FiAlertTriangle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-sm text-red-600">{uploadError}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleUploadContent}
                      disabled={!selectedFile || isUploading || isProcessing}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Retry Upload
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUploadContent}
                  disabled={!selectedFile || isUploading || isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Uploading...' : 'Upload Content'}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg text-center mb-4">
                <FiCheck className="mx-auto text-green-500 mb-2" size={32} />
                <p className="text-green-700 font-medium">
                  {contentType === 'video' ? 'Video' : 
                   contentType === 'image' ? 'Image' : 
                   'PDF document'} uploaded successfully!
                </p>
              </div>
              
              {/* Preview for images */}
              {contentType === 'image' && videoInfo.url && (
                <div className="mb-4 text-center">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="border border-gray-300 rounded-lg p-2 inline-block">
                    <img 
                      src={videoInfo.url} 
                      alt={videoInfo.title} 
                      className="max-h-40 max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* Preview for PDFs - just a link */}
              {contentType === 'pdf' && videoInfo.url && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Document Preview:</p>
                  <a 
                    href={videoInfo.url}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline flex items-center"
                  >
                    <FiFile className="mr-1" />
                    View PDF
                  </a>
                </div>
              )}
              
              <p className="text-sm font-medium text-gray-700 mb-1">Content URL:</p>
              <div className="bg-white border border-gray-300 rounded-lg p-2 mb-3 flex justify-between items-center">
                <p className="text-sm text-gray-700 truncate">{videoInfo.url || videoInfo.streamingUrl}</p>
                <button
                  onClick={() => copyToClipboard(videoInfo.url || videoInfo.streamingUrl)}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                  title="Copy URL"
                >
                  <FiClipboard size={16} />
                </button>
              </div>
              
              {/* For videos, also show the direct download URL if available */}
              {contentType === 'video' && videoInfo.directUrl && (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-1">Direct Download URL:</p>
                  <div className="bg-white border border-gray-300 rounded-lg p-2 mb-2 flex justify-between items-center">
                    <p className="text-sm text-gray-700 truncate">{videoInfo.directUrl}</p>
                    <button
                      onClick={() => copyToClipboard(videoInfo.directUrl)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                      title="Copy download URL"
                    >
                      <FiClipboard size={16} />
                    </button>
                  </div>
                </>
              )}
              
              {copied && (
                <p className="text-xs text-green-600 mt-1">
                  URL copied to clipboard!
                </p>
              )}
              
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={useVideoUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Use This URL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 