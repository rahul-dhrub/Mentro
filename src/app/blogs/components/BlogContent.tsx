'use client';

import React from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface BlogContentProps {
    content: string;
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
    return (
        <div className="prose prose-lg max-w-none text-gray-800">
            {typeof content === 'string' && content.includes('<p>') ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
                <div 
                    dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(marked.parse(content) as string) 
                    }} 
                    className="markdown-rendered" 
                />
            )}
        </div>
    );
};

export default BlogContent; 