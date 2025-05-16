'use client';

import { useState, FormEvent, ChangeEvent, useRef, KeyboardEvent } from 'react';
import { FiImage, FiVideo, FiFile, FiX, FiHash } from 'react-icons/fi';
import { Post, Media, Author } from '../types';

interface CreatePostProps {
  currentUser: Author;
  onPostCreate: (post: any) => void;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  type: 'image' | 'video' | 'file';
}

export default function CreatePost({ currentUser, onPostCreate }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [showHashtagInput, setShowHashtagInput] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const hashtagInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setUploadProgress([]);

    let reader;
    try {
      const formData = new FormData();
      
      // Add text content
      formData.append('content', content);
      formData.append('hashtags', JSON.stringify(hashtags));
      
      console.log('Content added:', content);
      console.log('Hashtags added:', hashtags);

      // Add all files first
      for (const image of images) {
        formData.append('images', image);
        console.log('Image added:', image.name);
      }

      for (const file of files) {
        formData.append('files', file);
        console.log('File added:', file.name);
      }

      if (video) {
        formData.append('video', video);
        console.log('Video added:', video.name);
      }

      // Log the final FormData contents
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Initialize progress trackers
      const allFiles = [
        ...images.map(file => ({ file, type: 'image' as const })),
        ...files.map(file => ({ file, type: 'file' as const })),
        ...(video ? [{ file: video, type: 'video' as const }] : [])
      ];

      allFiles.forEach(({ file, type }) => {
        setUploadProgress(prev => [...prev, {
          fileName: file.name,
          progress: 0,
          type
        }]);
      });

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      // Handle server-sent events
      reader = response.body.getReader();
      const decoder = new TextDecoder();

      console.log('Starting to read response stream');

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('Stream complete');
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Received SSE data:', data);
              
              if (data.type === 'complete' && data.post) {
                console.log('Received completion message');
                // Post creation completed
                onPostCreate(data.post);
                
                // Reset form
                setContent('');
                setHashtags([]);
                setHashtagInput('');
                setImages([]);
                setFiles([]);
                setVideo(null);
                setImagePreviewUrls([]);
                setVideoPreviewUrl('');
                setShowHashtagInput(false);
                setUploadProgress([]);
                setIsLoading(false);
                return; // Exit the function after successful completion
              } else if (data.fileName && typeof data.progress === 'number') {
                // Update progress
                setUploadProgress(prev =>
                  prev.map(item =>
                    item.fileName === data.fileName
                      ? { ...item, progress: data.progress }
                      : item
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    } finally {
      reader?.cancel();
      setIsLoading(false); // Ensure loading state is reset if the stream ends
    }
  };

  const handleHashtagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = hashtagInput.trim().replace(/^#/, '');
      if (tag && !hashtags.includes(`#${tag}`)) {
        setHashtags([...hashtags, `#${tag}`]);
        setHashtagInput('');
      }
    } else if (e.key === 'Backspace' && !hashtagInput) {
      e.preventDefault();
      setHashtags(hashtags.slice(0, -1));
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const updateProgress = (fileName: string, progress: number) => {
    setUploadProgress(prev =>
      prev.map(item =>
        item.fileName === fileName
          ? { ...item, progress }
          : item
      )
    );
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);

      // Generate preview URLs
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideo(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => prev.filter(p => p.fileName !== images[index].name));
  };

  const removeVideo = () => {
    if (video) {
      setUploadProgress(prev => prev.filter(p => p.fileName !== video.name));
    }
    setVideo(null);
    setVideoPreviewUrl('');
  };

  const removeFile = (index: number) => {
    setUploadProgress(prev => prev.filter(p => p.fileName !== files[index].name));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderProgressBar = (progress: UploadProgress) => (
    <div key={progress.fileName} className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
      <div
        className={`h-2.5 rounded-full transition-all duration-300 ${progress.type === 'image'
            ? 'bg-blue-500'
            : progress.type === 'video'
              ? 'bg-purple-500'
              : 'bg-green-500'
          }`}
        style={{ width: `${progress.progress}%` }}
      />
      <div className="text-xs text-gray-500 mt-1">
        {progress.fileName} - {Math.round(progress.progress)}%
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-12 h-12 rounded-full"
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <div className="relative bg-white rounded-xl border border-gray-200 focus-within:border-blue-500 transition-colors">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share?"
              className="w-full p-4 text-gray-900 text-base rounded-t-xl focus:outline-none min-h-[120px] resize-none"
              required
            />

            {/* Hashtags display */}
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 py-2 border-t border-gray-100">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1 text-blue-700 hover:text-blue-900"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Upload Progress Bars */}
            {uploadProgress.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="space-y-3">
                  {uploadProgress.map(progress => renderProgressBar(progress))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <FiImage className="w-5 h-5" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <FiVideo className="w-5 h-5" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <FiFile className="w-5 h-5" />
                  <span className="text-sm font-medium">Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHashtagInput(!showHashtagInput)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <FiHash className="w-5 h-5" />
                  <span className="text-sm font-medium">Add hashtag</span>
                </button>
              </div>
            </div>

            {/* Hashtag input */}
            {showHashtagInput && (
              <div className="px-4 py-3 border-t border-gray-200">
                <div className="flex items-center bg-gray-50 rounded-lg p-2">
                  <FiHash className="w-5 h-5 text-gray-400 mx-2" />
                  <input
                    ref={hashtagInputRef}
                    type="text"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKeyDown}
                    placeholder="Add a hashtag (press Enter)"
                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
            disabled={isLoading}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            disabled={isLoading}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="hidden"
            disabled={isLoading}
          />

          {/* Media previews */}
          {(imagePreviewUrls.length > 0 || videoPreviewUrl || files.length > 0) && (
            <div className="space-y-4 mt-4">
              {/* Image previews */}
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                          disabled={isLoading}
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Video preview */}
              {videoPreviewUrl && (
                <div className="relative group rounded-lg overflow-hidden">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full max-h-[300px] rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      disabled={isLoading}
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FiFile className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className={`px-6 py-2.5 rounded-full text-white font-medium text-sm transition-colors ${isLoading || !content.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 