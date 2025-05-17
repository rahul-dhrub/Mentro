'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import BlogEditor from './BlogEditor';
import CoverImageUpload from './CoverImageUpload';

interface BlogFormProps {
    userId: string | null | undefined;
    isSignedIn: boolean | undefined;
}

const BlogForm: React.FC<BlogFormProps> = ({ userId, isSignedIn }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [coverImage, setCoverImage] = useState('');
    const [tags, setTags] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editorSelection, setEditorSelection] = useState<{ start: number, end: number } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const router = useRouter();

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

            // Redirect to the new blog
            router.push(`/blogs/${newBlog.author.id}/${newBlog._id}`);

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

                <div className="mb-4">
                    <label htmlFor="tags" className="block text-sm font-semibold text-gray-800 mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-400 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="Education, Research, Technology"
                    />
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