'use client';

import React from 'react';
import Link from 'next/link';

interface Author {
    id: string;
    name: string;
    avatar: string;
}

interface RelatedBlog {
    _id?: string;
    id?: string;
    title: string;
    excerpt: string;
    coverImage: string;
    createdAt: string;
    author: Author;
    tags: string[];
    readTime: number;
}

interface RelatedPostsProps {
    relatedBlogs: RelatedBlog[];
    formatDate: (dateString: string) => string;
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ relatedBlogs, formatDate }) => {
    return (
        <div className="mt-16 p-8 bg-white/95 backdrop-blur-sm rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedBlogs.length > 0 ? (
                    relatedBlogs.map((relatedBlog) => (
                        <Link 
                            href={`/blogs/${relatedBlog.author.id}/${relatedBlog._id || relatedBlog.id}`} 
                            key={relatedBlog._id || relatedBlog.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-200"
                        >
                            <div className="h-40 overflow-hidden">
                                <img
                                    src={relatedBlog.coverImage}
                                    alt={relatedBlog.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-5 flex-grow">
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {relatedBlog.tags && relatedBlog.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{relatedBlog.title}</h3>
                                <p className="text-gray-700 mb-4 line-clamp-2">{relatedBlog.excerpt}</p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center">
                                        <img
                                            src={relatedBlog.author.avatar}
                                            alt={relatedBlog.author.name}
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span className="text-xs text-gray-700">{relatedBlog.author.name}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">{formatDate(relatedBlog.createdAt)}</div>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">{relatedBlog.readTime || '5'} min read</div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className="col-span-2 text-center text-gray-500">No related posts found</p>
                )}
            </div>
        </div>
    );
};

export default RelatedPosts; 