'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { Blog, mockBlogs as initialMockBlogs } from './[blog_id]/mockData';
import Background from './components/Background';
import BlogForm from './components/BlogForm';
import BlogList from './components/BlogList';
import { FiEdit3, FiUsers, FiPlus } from 'react-icons/fi';

type TabType = 'my-blogs' | 'others-blogs' | 'create-blog';

const BlogsPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('my-blogs');
    const [allBlogs, setAllBlogs] = useState<Blog[]>([]);
    const [myBlogs, setMyBlogs] = useState<Blog[]>([]);
    const [othersBlogs, setOthersBlogs] = useState<Blog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const { userId, isSignedIn } = useAuth();
    const { user } = useUser();

    // Fetch blogs from API
    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            // Fetch all blogs
            const response = await fetch('/api/blogs');

            if (response.ok) {
                const data = await response.json();
                const blogs = data.blogs;
                
                // Sort blogs by creation date (latest first)
                const sortedBlogs = blogs.sort((a: Blog, b: Blog) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                setAllBlogs(sortedBlogs);
                
                // Separate my blogs and others' blogs
                if (userId) {
                    const userBlogs = sortedBlogs.filter((blog: Blog) => blog.author.id === userId);
                    const otherUserBlogs = sortedBlogs.filter((blog: Blog) => blog.author.id !== userId);
                    
                    setMyBlogs(userBlogs);
                    setOthersBlogs(otherUserBlogs);
                } else {
                    // If not signed in, all blogs are "others"
                    setMyBlogs([]);
                    setOthersBlogs(sortedBlogs);
                }
            } else {
                // Fall back to mock data
                const sortedMockBlogs = [...initialMockBlogs].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                setAllBlogs(sortedMockBlogs);
                setMyBlogs([]); // No mock "my blogs" since we don't have user ID
                setOthersBlogs(sortedMockBlogs);
            }
        } catch (error) {
            console.error('Error fetching blogs:', error);
            // Fall back to mock data on error
            const sortedMockBlogs = [...initialMockBlogs].sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            setAllBlogs(sortedMockBlogs);
            setMyBlogs([]);
            setOthersBlogs(sortedMockBlogs);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchBlogs();
        }
    }, [userId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const tabs = [
        {
            id: 'my-blogs' as TabType,
            label: 'My Blogs',
            icon: FiEdit3,
            count: myBlogs.length,
            disabled: !isSignedIn
        },
        {
            id: 'others-blogs' as TabType,
            label: 'Others Blogs',
            icon: FiUsers,
            count: othersBlogs.length,
            disabled: false
        },
        {
            id: 'create-blog' as TabType,
            label: 'Create New Blog',
            icon: FiPlus,
            count: null,
            disabled: !isSignedIn
        }
    ];

    // Auto-switch to "Others Blogs" if user is not signed in and "My Blogs" is selected
    useEffect(() => {
        if (!isSignedIn && activeTab === 'my-blogs') {
            setActiveTab('others-blogs');
        }
    }, [isSignedIn, activeTab]);

    const getCurrentBlogs = () => {
        switch (activeTab) {
            case 'my-blogs':
                return myBlogs;
            case 'others-blogs':
                return othersBlogs;
            default:
                return [];
        }
    };

    // Handle successful blog creation
    const handleBlogCreated = async () => {
        // Refresh blogs data
        await fetchBlogs();
        // Switch to "My Blogs" tab to show the new blog
        setActiveTab('my-blogs');
        // Show success message
        setSuccessMessage('Blog published successfully!');
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'create-blog':
                return (
                    <BlogForm 
                        userId={userId} 
                        isSignedIn={isSignedIn}
                        onBlogCreated={handleBlogCreated}
                    />
                );
            case 'my-blogs':
            case 'others-blogs':
                return (
                    <BlogList 
                        blogs={getCurrentBlogs()} 
                        isLoading={isLoading} 
                        formatDate={formatDate}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Background>
            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded-lg">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700 font-medium">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs Navigation */}
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isDisabled = tab.disabled;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                                    disabled={isDisabled}
                                    className={`
                                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                        ${isActive
                                            ? 'border-blue-500 text-blue-600'
                                            : isDisabled
                                            ? 'border-transparent text-gray-400 cursor-not-allowed'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                                    `}
                                    title={isDisabled ? 'Sign in required' : ''}
                                >
                                    <Icon 
                                        className={`
                                            -ml-0.5 mr-2 h-5 w-5
                                            ${isActive
                                                ? 'text-blue-500'
                                                : isDisabled
                                                ? 'text-gray-400'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                            }
                                        `}
                                    />
                                    {tab.label}
                                    {tab.count !== null && (
                                        <span className={`
                                            ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${isActive
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }
                                        `}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
                
                {/* Sign in prompt for disabled tabs */}
                {!isSignedIn && (activeTab === 'my-blogs' || activeTab === 'create-blog') && (
                    <div className="px-6 py-4 bg-blue-50 border-l-4 border-blue-400">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Sign in required:</strong> You need to be signed in to view your blogs or create new ones.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {renderTabContent()}
            </div>
        </Background>
    );
};

export default BlogsPage; 