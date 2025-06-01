'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Blog } from '../mockData';
import Background from '../../components/Background';
import BlogEditor from '../../components/BlogEditor';
import CoverImageUpload from '../../components/CoverImageUpload';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorSelection, setEditorSelection] = useState<{ start: number, end: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      const blog_id = params.blog_id;
      
      if (!blog_id) {
        setErrorMessage('Blog ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/blogs/${blog_id}`);
        
        if (response.ok) {
          const data = await response.json();
          const blogData = data.blog;
          
          // Check if user is the owner
          if (!userId || blogData.author.id !== userId) {
            setErrorMessage('You are not authorized to edit this blog');
            setIsLoading(false);
            return;
          }
          
          setBlog(blogData);
          setTitle(blogData.title);
          setContent(blogData.content);
          setCoverImage(blogData.coverImage || '');
          setTags(Array.isArray(blogData.tags) ? blogData.tags.join(', ') : '');
        } else {
          setErrorMessage('Blog not found');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setErrorMessage('Failed to load blog');
      } finally {
        setIsLoading(false);
      }
    };

    if (isSignedIn) {
      fetchBlog();
    } else {
      setErrorMessage('You must be signed in to edit blogs');
      setIsLoading(false);
    }
  }, [params.blog_id, userId, isSignedIn]);

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      setErrorMessage('Title and content are required');
      return;
    }

    if (!blog) {
      setErrorMessage('Blog data not loaded');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/blogs/${blog._id || blog.id}`, {
        method: 'PUT',
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
        throw new Error(errorData.error || 'Failed to update blog');
      }

      // Redirect to the updated blog
      router.push(`/blogs/${blog._id || blog.id}`);
    } catch (error) {
      console.error('Error updating blog:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update blog. Please try again.');
    } finally {
      setIsSaving(false);
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
      
      const response = await fetch('/api/blogs/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      
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
      
      const response = await fetch('/api/blogs/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Cover image upload failed');
      }
      
      const data = await response.json();
      setCoverImage(data.url);
    } catch (error) {
      console.error('Error uploading cover image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload cover image. Please try again.');
    } finally {
      setIsCoverUploading(false);
      if (e.target.form) {
        e.target.form.reset();
      }
    }
  };

  if (isLoading) {
    return (
      <Background>
        <LoadingSpinner />
      </Background>
    );
  }

  if (errorMessage) {
    return (
      <Background>
        <div className="text-center py-16 bg-white/95 backdrop-blur-sm rounded-lg shadow-md">
          <h2 className="text-2xl font-medium text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-8">{errorMessage}</p>
          <Link 
            href="/blogs" 
            className="text-blue-600 hover:text-blue-800 bg-white px-4 py-2 rounded-md shadow-sm"
          >
            ← Back to blogs
          </Link>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <div className="mb-6">
        <Link 
          href={`/blogs/${blog?._id || blog?.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 bg-white/90 px-4 py-2 rounded-md shadow-sm"
        >
          ← Back to blog
        </Link>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Edit Blog</h1>

        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-800 font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleUpdateBlog}>
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

          <div className="mb-6">
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

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Updating...' : 'Update Blog'}
            </button>
            
            <Link
              href={`/blogs/${blog?._id || blog?.id}`}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-md shadow-sm transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </Background>
  );
} 