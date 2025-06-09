'use client';

import React, { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { FiEdit3, FiTrash2, FiHeart, FiShare, FiBookmark } from 'react-icons/fi';
import { useAnalytics } from '@/components/FirebaseAnalyticsProvider';

interface Blog {
    _id?: string;
    id?: string;
    title: string;
    author: {
        id: string;
        name: string;
    };
}

interface BlogActionsProps {
    blog?: Blog;
    onEdit?: () => void;
    onDelete?: () => void;
}

const BlogActions: React.FC<BlogActionsProps> = ({ blog, onEdit, onDelete }) => {
    const { userId } = useAuth();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const analytics = useAnalytics();

    const isOwner = blog && userId && blog.author.id === userId;

    const handleEdit = () => {
        analytics.trackEvent('blog_edit_click', {
            blog_id: blog?._id || blog?.id,
            blog_title: blog?.title,
            author_id: blog?.author.id
        });
        
        if (onEdit) {
            onEdit();
        } else if (blog) {
            // Navigate to edit page
            router.push(`/blogs/${blog._id || blog.id}/edit`);
        }
    };

    const handleDelete = async () => {
        if (!blog || !onDelete) return;

        analytics.trackEvent('blog_delete_attempt', {
            blog_id: blog._id || blog.id,
            blog_title: blog.title,
            author_id: blog.author.id
        });

        const confirmed = window.confirm('Are you sure you want to delete this blog? This action cannot be undone.');
        if (!confirmed) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/blogs/${blog._id || blog.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete blog');
            }

            // Call the delete callback or redirect
            if (onDelete) {
                onDelete();
            } else {
                router.push('/blogs');
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
                {/* Public Actions */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => {
                            analytics.trackEvent('blog_like', {
                                blog_id: blog?._id || blog?.id,
                                blog_title: blog?.title,
                                author_id: blog?.author.id
                            });
                        }}
                        className="flex items-center space-x-2 text-gray-700 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-md transition-colors"
                        aria-label="Like this post"
                    >
                        <FiHeart className="h-5 w-5" />
                        <span>Like</span>
                    </button>
                    
                    <button
                        onClick={() => {
                            analytics.trackEvent('blog_share', {
                                blog_id: blog?._id || blog?.id,
                                blog_title: blog?.title,
                                author_id: blog?.author.id
                            });
                        }}
                        className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-4 py-2 rounded-md transition-colors"
                        aria-label="Share this post"
                    >
                        <FiShare className="h-5 w-5" />
                        <span>Share</span>
                    </button>
                    
                    <button
                        onClick={() => {
                            analytics.trackEvent('blog_save', {
                                blog_id: blog?._id || blog?.id,
                                blog_title: blog?.title,
                                author_id: blog?.author.id
                            });
                        }}
                        className="flex items-center space-x-2 text-gray-700 hover:text-green-600 bg-gray-100 hover:bg-green-50 px-4 py-2 rounded-md transition-colors"
                        aria-label="Save this post"
                    >
                        <FiBookmark className="h-5 w-5" />
                        <span>Save</span>
                    </button>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleEdit}
                            className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-md transition-colors"
                            aria-label="Edit this post"
                        >
                            <FiEdit3 className="h-4 w-4" />
                            <span>Edit</span>
                        </button>
                        
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center space-x-2 text-red-700 hover:text-red-800 bg-red-100 hover:bg-red-200 px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Delete this post"
                        >
                            <FiTrash2 className="h-4 w-4" />
                            <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogActions; 