'use client';

import React from 'react';

interface Author {
    id: string;
    name: string;
    avatar: string;
}

interface BlogHeaderProps {
    title: string;
    tags: string[];
    author: Author;
    createdAt: string;
    readTime: number;
    coverImage: string;
    formatDate: (dateString: string) => string;
}

const BlogHeader: React.FC<BlogHeaderProps> = ({
    title,
    tags,
    author,
    createdAt,
    readTime,
    coverImage,
    formatDate
}) => {
    return (
        <header className="p-8 border-b border-gray-200">
            <div className="flex space-x-2 mb-4">
                {tags.map((tag, index) => (
                    <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-md shadow-sm"
                    >
                        {tag}
                    </span>
                ))}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            
            <div className="flex items-center mb-6">
                <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm"
                />
                <div>
                    <div className="text-gray-900 font-medium">{author.name}</div>
                    <div className="text-gray-700">
                        {formatDate(createdAt)} · {readTime} min read
                    </div>
                </div>
            </div>
            
            <div className="rounded-lg overflow-hidden mb-0 border border-gray-200 shadow-md">
                <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
        </header>
    );
};

export default BlogHeader; 