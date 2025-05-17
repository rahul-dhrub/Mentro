'use client';

import React from 'react';
import Link from 'next/link';

interface BlogErrorProps {
    error: string | null;
    userId: string | null;
}

const BlogError: React.FC<BlogErrorProps> = ({ error, userId }) => {
    return (
        <div className="text-center py-16 bg-white/95 backdrop-blur-sm rounded-lg shadow-md">
            <h2 className="text-2xl font-medium text-gray-900">{error || 'Blog not found'}</h2>
            <p className="mt-4 text-gray-700">The blog post you're looking for doesn't exist.</p>
            <div className="mt-8">
                <Link href={`/blogs/${userId}`} className="text-indigo-600 hover:text-indigo-800 bg-white px-4 py-2 rounded-md shadow-sm">
                    ← Back to blogs
                </Link>
            </div>
        </div>
    );
};

export default BlogError; 