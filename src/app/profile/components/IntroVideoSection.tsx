'use client';

import { FiEdit2, FiUpload, FiVideo } from 'react-icons/fi';

interface IntroVideoSectionProps {
  introVideo?: string;
  profileImage: string;
  isEditing: boolean;
  isUploading: boolean;
  onToggleEdit: () => void;
  onVideoChange: (value: string) => void;
  onVideoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  showEditButton?: boolean;
}

export default function IntroVideoSection({
  introVideo,
  profileImage,
  isEditing,
  isUploading,
  onToggleEdit,
  onVideoChange,
  onVideoUpload,
  onSave,
  onCancel,
  showEditButton = true
}: IntroVideoSectionProps) {
  // Helper function to check if URL is a Bunny CDN iframe embed
  const isBunnyIframeEmbed = (url: string): boolean => {
    return url.includes('iframe.mediadelivery.net/embed/') || url.includes('iframe.bunnycdn.com/embed/');
  };

  // Helper function to check if URL is a direct video file
  const isDirectVideoUrl = (url: string): boolean => {
    return /\.(mp4|webm|ogg|avi|mov|wmv|flv|m4v)(\?.*)?$/i.test(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Introduction Video</h2>
        {showEditButton && (
          <button
            onClick={onToggleEdit}
            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEdit2 size={16} />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="space-y-4">
            {/* Upload Video Option */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <label htmlFor="video-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-lg font-medium text-gray-900 mb-2">Uploading Video...</p>
                      <p className="text-sm text-gray-600">This may take a few minutes depending on file size</p>
                    </>
                  ) : (
                    <>
                      <FiUpload className="text-gray-400 mb-4" size={48} />
                      <p className="text-lg font-medium text-gray-900 mb-2">Upload Video</p>
                      <p className="text-sm text-gray-500 mb-4">
                        Click to upload or drag and drop your video file
                      </p>
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <FiVideo className="inline mr-2" size={16} />
                        Select Video File
                      </div>
                    </>
                  )}
                </div>
              </label>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={onVideoUpload}
                className="hidden"
                disabled={isUploading}
              />
            </div>

            {/* Or enter URL directly */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or enter video URL</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Video URL (Bunny CDN embed or direct video)
              </label>
              <input
                type="url"
                value={introVideo || ''}
                onChange={(e) => onVideoChange(e.target.value)}
                placeholder="https://iframe.mediadelivery.net/embed/424950/your-video-id"
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
              />
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Bunny CDN Embed:</strong> https://iframe.mediadelivery.net/embed/424950/your-video-id</p>
                <p><strong>Direct Video:</strong> https://your-bunny-zone.b-cdn.net/videos/your-video.mp4</p>
                <p>Both Bunny CDN iframe embeds and direct video URLs are supported</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="relative w-full">
          {introVideo ? (
            <>
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                {isBunnyIframeEmbed(introVideo) ? (
                  // Use iframe for Bunny CDN embeds
                  <iframe
                    src={introVideo}
                    title="Introduction Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : isDirectVideoUrl(introVideo) ? (
                  // Use video element for direct video files
                  <video
                    src={introVideo}
                    title="Introduction Video"
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    poster={profileImage}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  // Fallback for other video URLs (try iframe first, then video)
                  <iframe
                    src={introVideo}
                    title="Introduction Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    onError={(e) => {
                      // If iframe fails, try video element
                      const target = e.target as HTMLIFrameElement;
                      const video = document.createElement('video');
                      video.src = introVideo!;
                      video.controls = true;
                      video.className = "w-full h-full object-cover";
                      target.parentNode?.replaceChild(video, target);
                    }}
                  />
                )}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Watch this introduction video to learn more about my teaching approach and experience.
              </p>
            </>
          ) : (
            <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <FiVideo className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500 mb-2">No introduction video added yet</p>
                {showEditButton && (
                  <button
                    onClick={onToggleEdit}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <FiUpload size={16} />
                    Add Video
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 