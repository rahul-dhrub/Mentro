'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { FiUsers, FiHash } from 'react-icons/fi';
import BlogEditor from './BlogEditor';
import CoverImageUpload from './CoverImageUpload';

interface HashtagSuggestion {
    name: string;
    followerCount: number;
    postCount: number;
    description?: string;
}

interface BlogFormProps {
    userId: string | null | undefined;
    isSignedIn: boolean | undefined;
    onBlogCreated?: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ userId, isSignedIn, onBlogCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editorSelection, setEditorSelection] = useState<{ start: number, end: number } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    
    // Hashtag suggestions state
    const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    
    const router = useRouter();
    const tagsInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Debounce hashtag search
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            const currentInput = tags.split(',').pop()?.trim() || '';
            if (currentInput.length > 0 && (currentInput.startsWith('#') || currentInput.length >= 2)) {
                searchHashtags(currentInput);
            } else {
                setHashtagSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayedSearch);
    }, [tags]);

    const searchHashtags = async (query: string) => {
        try {
            setIsLoadingSuggestions(true);
            const searchQuery = query.startsWith('#') ? query.slice(1) : query;
            const response = await fetch(`/api/hashtags/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
            
            if (response.ok) {
                const data = await response.json();
                setHashtagSuggestions(data.hashtags || []);
                setShowSuggestions(data.hashtags?.length > 0);
            } else {
                // Fallback suggestions for development
                const mockSuggestions: HashtagSuggestion[] = [
                    { name: '#education', followerCount: 1250, postCount: 340 },
                    { name: '#research', followerCount: 890, postCount: 180 },
                    { name: '#technology', followerCount: 2100, postCount: 520 },
                    { name: '#science', followerCount: 1500, postCount: 290 }
                ].filter(h => h.name.toLowerCase().includes(searchQuery.toLowerCase()));
                
                setHashtagSuggestions(mockSuggestions);
                setShowSuggestions(mockSuggestions.length > 0);
            }
        } catch (error) {
            console.error('Error fetching hashtag suggestions:', error);
            setHashtagSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || hashtagSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => 
                    prev < hashtagSuggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => 
                    prev > 0 ? prev - 1 : hashtagSuggestions.length - 1
                );
                break;
            case 'Tab':
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    selectHashtag(hashtagSuggestions[selectedSuggestionIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                break;
        }
    };

    const selectHashtag = (hashtag: HashtagSuggestion) => {
        const tagsList = tags.split(',').map(t => t.trim());
        tagsList[tagsList.length - 1] = hashtag.name.startsWith('#') ? hashtag.name.slice(1) : hashtag.name;
        
        setTags(tagsList.join(', ') + ', ');
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        tagsInputRef.current?.focus();
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTags(e.target.value);
        setSelectedSuggestionIndex(-1);
    };

    const handleCreateBlog = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content) {
            setErrorMessage('Title and content are required');
            return;
        }

        if (!isSignedIn) {
            setErrorMessage('You must be signed in to create a blog');
            return;
        }

        setIsLoading(true);

        try {
            // Create blog via API
            const response = await fetch('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    coverImage,
                    tags,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create blog');
            }

            const data = await response.json();
            const newBlog = data.blog;

            // Reset form
            setTitle('');
            setContent('');
            setCoverImage('');
            setTags('');
            setErrorMessage('');

            // Call callback if provided, otherwise redirect to the new blog
            if (onBlogCreated) {
                onBlogCreated();
            } else {
                // Fallback: redirect to the new blog with updated URL structure
                router.push(`/blogs/${newBlog._id}`);
            }

        } catch (error) {
            console.error('Error creating blog:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create blog. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', files[0]);
            
            // Use the new Bunny.net upload endpoint
            const response = await fetch('/api/blogs/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }
            
            const data = await response.json();
            
            // Insert the image markdown at the cursor position
            if (editorSelection) {
                const newContent = 
                    content.substring(0, editorSelection.start) + 
                    `![Image](${data.url})` + 
                    content.substring(editorSelection.end);
                
                setContent(newContent);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            // Clear the file input
            if (e.target.form) {
                e.target.form.reset();
            }
        }
    };

    // Handle cover image upload
    const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        try {
            setIsCoverUploading(true);
            const formData = new FormData();
            formData.append('file', files[0]);
            
            // Use the Bunny.net upload endpoint
            const response = await fetch('/api/blogs/upload', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Cover image upload failed');
            }
            
            const data = await response.json();
            
            // Set the cover image URL
            setCoverImage(data.url);
        } catch (error) {
            console.error('Error uploading cover image:', error);
            alert(error instanceof Error ? error.message : 'Failed to upload cover image. Please try again.');
        } finally {
            setIsCoverUploading(false);
            // Clear the file input
            if (e.target.form) {
                e.target.form.reset();
            }
        }
    };

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Create New Blog</h2>

            {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
                    <p className="text-red-800 font-medium">{errorMessage}</p>
                </div>
            )}

            <form onSubmit={handleCreateBlog}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-400 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="Enter blog title"
                    />
                </div>

                <BlogEditor
                    content={content}
                    setContent={setContent}
                    editorSelection={editorSelection}
                    setEditorSelection={setEditorSelection}
                    isUploading={isUploading}
                    handleImageUpload={handleImageUpload}
                />

                <CoverImageUpload
                    coverImage={coverImage}
                    setCoverImage={setCoverImage}
                    isCoverUploading={isCoverUploading}
                    handleCoverImageUpload={handleCoverImageUpload}
                />

                <div className="mb-4 relative">
                    <label htmlFor="tags" className="block text-sm font-semibold text-gray-800 mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        ref={tagsInputRef}
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={handleTagsChange}
                        onKeyDown={handleTagsKeyDown}
                        className="w-full px-3 py-2 border border-gray-400 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="Education, Research, Technology"
                    />
                    
                    {/* Hashtag Suggestions Dropdown */}
                    {showSuggestions && (
                        <div 
                            ref={suggestionsRef}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                        >
                            {isLoadingSuggestions ? (
                                <div className="px-4 py-2 text-gray-500">Loading suggestions...</div>
                            ) : (
                                hashtagSuggestions.map((hashtag, index) => (
                                    <div
                                        key={hashtag.name}
                                        className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                                            index === selectedSuggestionIndex 
                                                ? 'bg-indigo-50 border-indigo-200' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => selectHashtag(hashtag)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {hashtag.name}
                                                </div>
                                                {hashtag.description && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {hashtag.description}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 ml-4">
                                                <div className="flex items-center space-x-1">
                                                    <FiUsers className="w-4 h-4" />
                                                    <span>{hashtag.followerCount}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <FiHash className="w-4 h-4" />
                                                    <span>{hashtag.postCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <p className="text-xs text-gray-600 mt-1">
                        Tip: Use hashtags (#tag) in your title or content to make your blog discoverable!
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !isSignedIn}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Publishing...' : 'Publish Blog'}
                </button>

                {!isSignedIn && (
                    <p className="mt-2 text-sm font-medium text-gray-800 bg-yellow-50 p-2 rounded">
                        You must be signed in to create a blog.
                    </p>
                )}
            </form>
        </div>
    );
};

export default BlogForm; 