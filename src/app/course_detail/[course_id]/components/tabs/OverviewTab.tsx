import React, { useState, useRef } from 'react';
import { FiBook, FiClock, FiPlus, FiVideo, FiUpload, FiX, FiCheck, FiClipboard, FiAlertTriangle } from 'react-icons/fi';
import StatCard from '../StatCard';
import { initializeVideoUpload, uploadVideoToBunny, waitForVideoProcessing } from '../../../../utils/videoUpload';

export interface CourseStats {
  totalStudents: number;
  completionRate: number;
  averageRating: number;
  newAssignmentSubmissions: number;
  quizCompletions: number;
  newEnrollments: number;
}

interface OverviewTabProps {
  stats?: CourseStats;
  statsLoading?: boolean;
  statsError?: string | null;
  onAddChapter: (chapterData: { title: string; description: string }) => Promise<void>;
  onCreateAssignment: () => void;
  onCreateQuiz: () => void;
  onTabChange: (tab: string) => void;
}

export default function OverviewTab({ 
  stats,
  statsLoading = false,
  statsError = null,
  onAddChapter, 
  onCreateAssignment, 
  onCreateQuiz,
  onTabChange
}: OverviewTabProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleUploadVideo = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      
      // Step 1: Initialize upload and get credentials
      const title = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      const { guid, uploadUrl, httpMethod, headers } = await initializeVideoUpload(
        title,
        selectedFile.name
      );
      
      // Step 2: Upload the file to Bunny.net with enhanced retry functionality
      await uploadVideoToBunny(
        selectedFile,
        uploadUrl,
        httpMethod,
        headers,
        (progress: number) => setUploadProgress(progress)
      );
      
      // Step 3: Wait for processing
      setIsUploading(false);
      setIsProcessing(true);
      
      const processedVideo = await waitForVideoProcessing(guid);
      setVideoInfo(processedVideo);
      
      setIsProcessing(false);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload video';
      if (error.message.includes('network')) {
        errorMessage = 'Network connection lost. Please try again with a stable connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try again with a smaller file or better connection.';
      } else if (error.message.includes('aborted')) {
        errorMessage = 'Upload was aborted. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setIsUploading(false);
      setIsProcessing(false);
    }
  };
  
  const closeModal = () => {
    setShowUploadModal(false);
    setSelectedFile(null);
    setVideoInfo(null);
    setError(null);
    setUploadProgress(0);
    setCopied(false);
  };
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard title="Course Statistics" icon={<FiBook className="text-blue-500" size={24} />}>
        <div>
          <p className="text-sm text-gray-600">Total Students</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats !== undefined ? stats.totalStudents : 'Loading...'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats !== undefined ? `${stats.completionRate}%` : 'Loading...'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Average Rating</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats !== undefined ? stats.averageRating.toFixed(1) : 'Loading...'}
          </p>
        </div>
      </StatCard>

      <StatCard title="Recent Activity" icon={<FiClock className="text-blue-500" size={24} />}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">New Assignment Submissions</p>
          <p className="text-sm font-medium text-gray-900">
            {stats !== undefined ? stats.newAssignmentSubmissions : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Quiz Completions</p>
          <p className="text-sm font-medium text-gray-900">
            {stats !== undefined ? stats.quizCompletions : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">New Enrollments</p>
          <p className="text-sm font-medium text-gray-900">
            {stats !== undefined ? stats.newEnrollments : 'Loading...'}
          </p>
        </div>
      </StatCard>

      <StatCard title="Quick Actions" icon={<FiPlus className="text-blue-500" size={24} />}>
        <button 
          onClick={() => onTabChange('chapters')}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Add New Chapter
        </button>
        <button 
          onClick={() => {
            onTabChange('assignments');
            onCreateAssignment();
          }}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
        >
          Create Assignment
        </button>
        <button 
          onClick={() => {
            onTabChange('quizzes');
            onCreateQuiz();
          }}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Create Quiz
        </button>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer flex items-center justify-center"
        >
          <FiUpload className="mr-2" />
          Upload Video to Bunny.net
        </button>
      </StatCard>
      
      {/* Video Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Upload Video to Bunny.net</h3>
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
                    <FiVideo className="mx-auto text-gray-400 mb-3" size={36} />
                    <p className="text-sm text-gray-600 mb-2">
                      Select a video file to upload
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="video/*"
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
                  
                  {isProcessing && (
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
                  
                  {error && (
                    <div className="bg-red-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-start">
                        <FiAlertTriangle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={handleUploadVideo}
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
                      onClick={handleUploadVideo}
                      disabled={!selectedFile || isUploading || isProcessing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center mb-4">
                    <FiCheck className="mx-auto text-green-500 mb-2" size={32} />
                    <p className="text-green-700 font-medium">Video uploaded successfully!</p>
                  </div>
                  
                  <p className="text-sm font-medium text-gray-700 mb-1">Streaming URL:</p>
                  <div className="bg-white border border-gray-300 rounded-lg p-2 mb-3 flex justify-between items-center">
                    <p className="text-sm text-gray-700 truncate">{videoInfo.streamingUrl}</p>
                    <button
                      onClick={() => copyToClipboard(videoInfo.streamingUrl)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                      title="Copy streaming URL"
                    >
                      <FiClipboard size={16} />
                    </button>
                  </div>
                  
                  {videoInfo.directUrl && (
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
                  
                  <p className="text-xs text-gray-500 mt-3">
                    You can use these URLs in your lessons for streaming and downloading.
                  </p>
                  
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 