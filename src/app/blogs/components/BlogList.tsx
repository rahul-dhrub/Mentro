'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Blog } from '../[user_id]/mockData';

interface BlogListProps {
    blogs: Blog[];
    isLoading: boolean;
    formatDate: (dateString: string) => string;
}

const BlogList: React.FC<BlogListProps> = ({ blogs, isLoading, formatDate }) => {
    const [showBlogs, setShowBlogs] = useState<boolean>(true);

    return (
        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-black">Recent Blogs</h2>
                <button 
                    onClick={() => setShowBlogs(!showBlogs)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 flex items-center"
                >
                    {showBlogs ? (
                        <>
                            <span className="mr-1">Hide</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    ) : (
                        <>
                            <span className="mr-1">Show</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </>
                    )}
                </button>
            </div>

            {showBlogs && (
                <>
                    {isLoading && blogs.length === 0 ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900">No blogs yet</h3>
                            <p className="mt-1 text-gray-500">Be the first to share your knowledge!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <Link href={`/blogs/${blog.author.id}/${blog._id || blog.id}`} key={blog._id || blog.id}>
                                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col border border-gray-200">
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={blog.coverImage}
                                                alt={blog.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-5 flex-grow">
                                            <div className="flex space-x-2 mb-3">
                                                {blog.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
                                            <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center">
                                                    <img
                                                        src={blog.author.avatar}
                                                        alt={blog.author.name}
                                                        className="w-8 h-8 rounded-full mr-2"
                                                    />
                                                    <span className="text-sm text-gray-700">{blog.author.name}</span>
                                                </div>
                                                <div className="text-sm text-gray-500">{formatDate(blog.createdAt)}</div>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-500">{blog.readTime} min read</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default BlogList; 