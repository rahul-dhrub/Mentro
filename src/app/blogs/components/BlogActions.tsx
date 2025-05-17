'use client';

import React from 'react';

const BlogActions: React.FC = () => {
    return (
        <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center space-x-4">
                <button
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
                    aria-label="Like this post"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>Like</span>
                </button>
                
                <button
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
                    aria-label="Share this post"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                </button>
                
                <button
                    className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md transition-colors"
                    aria-label="Save this post"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Save</span>
                </button>
            </div>
        </div>
    );
};

export default BlogActions; 