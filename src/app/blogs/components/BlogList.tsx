'use client';

import React from 'react';
import Link from 'next/link';
import { Blog } from '../[blog_id]/mockData';
import { FiClock, FiUser, FiTag } from 'react-icons/fi';

interface BlogListProps {
    blogs: Blog[];
    isLoading: boolean;
    formatDate: (dateString: string) => string;
}

const BlogList: React.FC<BlogListProps> = ({ blogs, isLoading, formatDate }) => {
    return (
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            {isLoading && blogs.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading blogs...</p>
                    </div>
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                    <p className="text-gray-500">Be the first to share your knowledge!</p>
                </div>
            ) : (
                <>
                    {/* Header with count */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {blogs.length} {blogs.length === 1 ? 'Blog' : 'Blogs'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Latest articles first</p>
                        </div>
                    </div>

                    {/* Grid of blogs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog) => (
                            <Link 
                                href={`/blogs/${blog._id || blog.id}`} 
                                key={blog._id || blog.id}
                                className="group"
                            >
                                <article className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col border border-gray-100 group-hover:border-gray-200">
                                    {/* Cover Image */}
                                    <div className="h-48 overflow-hidden bg-gray-100">
                                        <img
                                            src={blog.coverImage}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-6 flex-grow flex flex-col">
                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {blog.tags.slice(0, 2).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                                >
                                                    <FiTag className="w-3 h-3 mr-1" />
                                                    {tag}
                                                </span>
                                            ))}
                                            {blog.tags.length > 2 && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                                    +{blog.tags.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Title */}
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {blog.title}
                                        </h3>
                                        
                                        {/* Excerpt */}
                                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-sm leading-relaxed">
                                            {blog.excerpt}
                                        </p>
                                        
                                        {/* Footer */}
                                        <div className="mt-auto">
                                            {/* Author and Date */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center">
                                                    <img
                                                        src={blog.author.avatar}
                                                        alt={blog.author.name}
                                                        className="w-8 h-8 rounded-full mr-3 border-2 border-white shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{blog.author.name}</p>
                                                        <p className="text-xs text-gray-500">{formatDate(blog.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Read Time */}
                                            <div className="flex items-center text-xs text-gray-500">
                                                <FiClock className="w-3 h-3 mr-1" />
                                                {blog.readTime} min read
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BlogList; 