'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Navbar from './components/Navbar';
import CourseSidebar from './components/CourseSidebar';
import { Post, Author } from './types';
import { mockPosts, mockAuthors } from './mockData';

// Dynamically import BackgroundEffect with no SSR
const BackgroundEffect = dynamic(
  () => import('./components/BackgroundEffect'),
  { ssr: false }
);

const mockCourses = [
  {
    id: '1',
    title: 'Advanced Machine Learning',
    code: 'CS501',
    students: 35,
    progress: 75
  },
  {
    id: '2',
    title: 'Data Structures and Algorithms',
    code: 'CS301',
    students: 42,
    progress: 60
  },
  {
    id: '3',
    title: 'Software Engineering',
    code: 'CS401',
    students: 28,
    progress: 45
  }
];

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const currentUser = mockAuthors[0];

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handlePostCreate = (newPost: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments'>) => {
    const post: Post = {
      ...newPost,
      id: Date.now().toString(),
      likes: 0,
      comments: [],
      timestamp: 'Just now'
    };
    setPosts([post, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId: string, content: string) => {
    setPosts(posts.map(post => 
      post.id === postId
        ? {
            ...post,
            comments: [
              {
                id: Date.now().toString(),
                author: currentUser,
                content,
                timestamp: 'Just now',
                likes: 0
              },
              ...post.comments
            ]
          }
        : post
    ));
  };

  const handleShare = (postId: string) => {
    // In a real app, this would open a share dialog
    console.log('Sharing post:', postId);
  };

  const facultyStats = {
    followers: 1250,
    rating: 4.8,
    blogs: 45,
    publications: 28
  };

  const socialLinks = {
    email: 'sarah.johnson@university.edu',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    twitter: 'https://twitter.com/sarahjohnson'
  };

  const upcomingClasses = [
    {
      id: '1',
      title: 'Advanced Machine Learning',
      time: '10:00 AM - 11:30 AM',
      room: 'CS-101',
      students: 35
    },
    {
      id: '2',
      title: 'Data Structures',
      time: '2:00 PM - 3:30 PM',
      room: 'CS-203',
      students: 42
    },
    {
      id: '3',
      title: 'Software Engineering',
      time: '4:00 PM - 5:30 PM',
      room: 'CS-105',
      students: 28
    }
  ];

  const messages = [
    {
      id: '1',
      sender: {
        name: 'Dr. Michael Chen',
        avatar: mockAuthors[0].avatar
      },
      content: 'Can we discuss the research proposal tomorrow?',
      time: '5m ago',
      unread: true
    },
    {
      id: '2',
      sender: {
        name: 'Dr. Emily Rodriguez',
        avatar: mockAuthors[0].avatar
      },
      content: 'The workshop materials are ready for review.',
      time: '1h ago',
      unread: false
    },
    {
      id: '3',
      sender: {
        name: 'John Smith',
        avatar: 'https://ui-avatars.com/api/?name=John+Smith'
      },
      content: 'Thank you for the feedback on my thesis!',
      time: '2h ago',
      unread: false
    }
  ];

  return (
    <>
      <BackgroundEffect />
      <Navbar 
        user={currentUser} 
        onSidebarToggle={toggleSidebar}
        isSidebarVisible={isSidebarVisible}
      />
      <div className="flex min-h-screen pt-16">
        <CourseSidebar 
          courses={mockCourses} 
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex gap-8">
              {/* Left Sidebar */}
              <div className="hidden lg:block">
                <Sidebar
                  author={currentUser}
                  stats={facultyStats}
                  socialLinks={socialLinks}
                />
              </div>

              {/* Main Content */}
              <div className="flex-1 max-w-2xl">
                <CreatePost
                  onPostCreate={handlePostCreate}
                  currentUser={currentUser}
                />

                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      currentUser={currentUser}
                    />
                  ))}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="hidden xl:block">
                <RightSidebar
                  upcomingClasses={upcomingClasses}
                  messages={messages}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
