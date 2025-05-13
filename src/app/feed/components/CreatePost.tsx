'use client';

import { useState } from 'react';
import { FiImage, FiVideo, FiFile, FiFileText, FiX } from 'react-icons/fi';
import { Post, Media } from '../types';

interface CreatePostProps {
  onPostCreate: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => void;
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    department: string;
  };
}

export default function CreatePost({ onPostCreate, currentUser }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const mediaItem: Media = {
          type: getMediaType(file),
          url: reader.result as string,
          title: file.name,
          size: formatFileSize(file.size)
        };
        setMedia([...media, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  const getMediaType = (file: File): Media['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) return;

    onPostCreate({
      author: currentUser,
      content: content.trim(),
      media: media.length > 0 ? media : undefined,
      tags: tags.length > 0 ? tags : undefined
    });

    // Reset form
    setContent('');
    setMedia([]);
    setTags([]);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 text-lg placeholder-gray-500"
          placeholder="Share your thoughts..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {/* Tags Input */}
        <div className="mt-3">
          <input
            type="text"
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Add tags (press Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-blue-600"
                >
                  <FiX size={16} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="mt-3 space-y-3">
            {media.map((item, index) => (
              <div key={index} className="relative">
                {item.type === 'image' && (
                  <div className="relative h-48">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white p-1.5 rounded-full hover:bg-opacity-90"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                )}
                {item.type === 'video' && (
                  <div className="relative h-48">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white p-1.5 rounded-full hover:bg-opacity-90"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                )}
                {(item.type === 'pdf' || item.type === 'document') && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {item.type === 'pdf' ? (
                        <FiFileText size={32} className="text-red-500" />
                      ) : (
                        <FiFile size={32} className="text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">{item.size}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer font-medium">
              <FiImage className="mr-2" size={18} />
              Image
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
            <label className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer font-medium">
              <FiVideo className="mr-2" size={18} />
              Video
              <input
                type="file"
                accept="video/*"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
            <label className="flex items-center text-gray-700 hover:text-blue-600 cursor-pointer font-medium">
              <FiFile className="mr-2" size={18} />
              Document
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleMediaChange}
                className="hidden"
              />
            </label>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            disabled={!content.trim() && media.length === 0}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
} 