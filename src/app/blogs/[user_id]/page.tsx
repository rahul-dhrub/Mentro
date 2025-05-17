'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Blog, mockBlogs as initialMockBlogs } from './mockData';
import Background from '../components/Background';
import BlogForm from '../components/BlogForm';
import BlogList from '../components/BlogList';

const BlogsPage = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { userId, isSignedIn } = useAuth();

    useEffect(() => {
        // Fetch blogs from API
        const fetchBlogs = async () => {
            setIsLoading(true);
            try {
                // Try to fetch from API first
                const response = await fetch(`/api/blogs?userId=${userId || ''}`);

                if (response.ok) {
                    const data = await response.json();
                    setBlogs(data.blogs);
                } else {
                    // Fall back to mock data
                    setBlogs(initialMockBlogs);
                }
            } catch (error) {
                console.error('Error fetching blogs:', error);
                // Fall back to mock data on error
                setBlogs(initialMockBlogs);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogs();
    }, [userId]); // Re-fetch when userId changes

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Background>
            {/* Create Blog Form */}
            <BlogForm 
                userId={userId} 
                isSignedIn={isSignedIn} 
            />

            {/* Blog List */}
            <BlogList 
                blogs={blogs} 
                isLoading={isLoading} 
                formatDate={formatDate}
            />
        </Background>
    );
};

export default BlogsPage; 