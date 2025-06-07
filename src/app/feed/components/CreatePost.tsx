'use client';

import { useState, FormEvent, ChangeEvent, useRef, KeyboardEvent, useEffect } from 'react';
import { FiImage, FiVideo, FiFile, FiX, FiHash, FiUser, FiUsers } from 'react-icons/fi';
import { Post, Media, Author } from '../types';

interface CreatePostProps {
  currentUser: Author;
  onPostCreate: (post: any) => void;
  onTogglePersonalPosts?: (isPersonal: boolean) => void;
  isPersonalPosts?: boolean;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  type: 'image' | 'video' | 'file';
}

interface HashtagSuggestion {
  name: string;
  followerCount: number;
  postCount: number;
}

export default function CreatePost({ currentUser, onPostCreate, onTogglePersonalPosts, isPersonalPosts = false }: CreatePostProps) {
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
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Refs for file inputs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const hashtagInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch hashtag suggestions
  const fetchHashtagSuggestions = async (query: string) => {
    if (!query.trim()) {
      setHashtagSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/hashtags/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setHashtagSuggestions(data.hashtags || []);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error('Error fetching hashtag suggestions:', error);
      // Fallback to mock suggestions for development
      const mockSuggestions: HashtagSuggestion[] = [
        { name: `#${query}research`, followerCount: 245, postCount: 89 },
        { name: `#${query}science`, followerCount: 156, postCount: 67 },
        { name: `#${query}education`, followerCount: 198, postCount: 43 },
        { name: `#${query}technology`, followerCount: 302, postCount: 125 },
        { name: `#${query}innovation`, followerCount: 89, postCount: 34 }
      ].filter(suggestion => 
        suggestion.name.toLowerCase().includes(query.toLowerCase()) &&
        !hashtags.includes(suggestion.name)
      );
      setHashtagSuggestions(mockSuggestions.slice(0, 5));
      setShowSuggestions(mockSuggestions.length > 0);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Handle hashtag input changes
  const handleHashtagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/^#/, '');
    setHashtagInput(value);
    fetchHashtagSuggestions(value);
  };

  // Handle clicking outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setUploadProgress([]);

    try {
      const formData = new FormData();
      
      // Add text content
      formData.append('content', content);
      formData.append('hashtags', JSON.stringify(hashtags));
      
      // Format media data
      const mediaData: Media[] = [];

      // Add images
      for (const image of images) {
        formData.append('images', image);
        mediaData.push({
          type: 'image',
          url: '', // Server will replace with actual URL
          title: image.name,
          size: `${(image.size / (1024 * 1024)).toFixed(2)} MB`
        });
      }

      // Add files
      for (const file of files) {
        formData.append('files', file);
        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        mediaData.push({
          type: isPdf ? 'pdf' : 'document',
          url: '', // Server will replace with actual URL
          title: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        });
      }

      // Add video
      if (video) {
        formData.append('video', video);
        mediaData.push({
          type: 'video',
          url: '', // Server will replace with actual URL
          title: video.name,
          size: `${(video.size / (1024 * 1024)).toFixed(2)} MB`,
          thumbnail: '' // Server will replace with actual thumbnail
        });
      }

      // Add media data to form
      formData.append('media', JSON.stringify(mediaData));

      console.log('Sending media data:', { content, mediaData, hashtags });

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      // Handle server-sent events
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

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
                // Clean up object URLs
                imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
                if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);

                // Post creation completed - hashtag associations are handled by the backend
                console.log('Post created successfully with hashtags:', {
                  postId: data.post._id,
                  hashtags: data.post.tags || [],
                  hashtagObjects: data.post.hashtags || []
                });
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
                setHashtagSuggestions([]);
                setShowSuggestions(false);
                setIsLoading(false);
                return;
              } else if (data.fileName && typeof data.progress === 'number') {
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
              throw new Error('Error processing server response');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHashtagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < hashtagSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Tab' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      const selectedSuggestion = hashtagSuggestions[selectedSuggestionIndex];
      addHashtag(selectedSuggestion.name);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        const selectedSuggestion = hashtagSuggestions[selectedSuggestionIndex];
        addHashtag(selectedSuggestion.name);
      } else {
        const tag = hashtagInput.trim().replace(/^#/, '');
        if (tag) {
          addHashtag(`#${tag}`);
        }
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === 'Backspace' && !hashtagInput && hashtags.length > 0) {
      e.preventDefault();
      setHashtags(hashtags.slice(0, -1));
    }
  };

  const addHashtag = (tag: string) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!hashtags.includes(formattedTag)) {
      setHashtags([...hashtags, formattedTag]);
      setHashtagInput('');
      setHashtagSuggestions([]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const selectSuggestion = (suggestion: HashtagSuggestion) => {
    addHashtag(suggestion.name);
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="ml-1 text-blue-700 hover:text-blue-900 cursor-pointer"
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
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  <FiImage className="w-5 h-5" />
                  <span className="text-sm font-medium">Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  <FiVideo className="w-5 h-5" />
                  <span className="text-sm font-medium">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  <FiFile className="w-5 h-5" />
                  <span className="text-sm font-medium">Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowHashtagInput(!showHashtagInput)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  <FiHash className="w-5 h-5" />
                  <span className="text-sm font-medium">Add hashtag</span>
                </button>
          </div>
        </div>

            {/* Hashtag input */}
            {showHashtagInput && (
              <div className="px-4 py-3 border-t border-gray-200 relative">
                <div className="flex items-center bg-gray-50 rounded-lg p-2">
                  <FiHash className="w-5 h-5 text-gray-400 mx-2" />
                  <input
                    ref={hashtagInputRef}
                    type="text"
                    value={hashtagInput}
                    onChange={handleHashtagInputChange}
                    onKeyDown={handleHashtagKeyDown}
                    placeholder="Add a hashtag (press Enter)"
                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500 text-sm"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Hashtag Suggestions */}
                {showSuggestions && hashtagSuggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    style={{ left: '16px', right: '16px', width: 'calc(100% - 32px)' }}
                  >
                    {hashtagSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.name}
                        onClick={() => selectSuggestion(suggestion)}
                        className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                          index === selectedSuggestionIndex
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FiHash className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-900">{suggestion.name}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <FiUsers className="w-3 h-3" />
                              <span>{suggestion.followerCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FiHash className="w-3 h-3" />
                              <span>{suggestion.postCount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
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
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
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
                        className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 cursor-pointer"
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

          <div className="flex items-center justify-between pt-3">
            {/* My Posts Switch */}
            <div className="flex items-center space-x-3">
              <div className="relative inline-flex items-center">
              <input
                  type="checkbox"
                  id="myPosts"
                  checked={isPersonalPosts}
                  onChange={(e) => {
                    onTogglePersonalPosts?.(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <label
                  htmlFor="myPosts"
                  className={`flex items-center w-14 h-7 rounded-full 
                    bg-gray-200 cursor-pointer transition-all duration-300 ease-in-out
                    peer-checked:bg-blue-600 
                    after:content-[''] after:absolute after:top-0.5 after:left-0.5 
                    after:bg-white after:rounded-full after:h-6 after:w-6 after:shadow-sm
                    after:transition-all after:duration-300 after:ease-in-out
                    peer-checked:after:translate-x-7
                    peer-checked:after:border-white
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100`}
                >
                  <span className="sr-only">Toggle personal posts</span>
            </label>
                <div className="flex items-center ml-3 space-x-2">
                  <FiUser className={`w-4 h-4 ${isPersonalPosts ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className={`text-sm font-medium ${isPersonalPosts ? 'text-blue-600' : 'text-gray-700'}`}>
                    My Posts
                  </span>
                </div>
              </div>
          </div>

            {/* Post Button */}
          <button
            type="submit"
              disabled={isLoading || !content.trim()}
              className={`px-6 py-2.5 rounded-full text-white font-medium text-sm transition-colors ${
                isLoading || !content.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              }`}
          >
              {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 