'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Navbar from './components/Navbar';
import CourseSidebar from './components/CourseSidebar';
import { Post, Author } from './types';
import { mockAuthors } from './mockData';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isPersonalPosts, setIsPersonalPosts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const currentUser = {
    ...mockAuthors[0],
    title: mockAuthors[0].title || 'Faculty Member'
  };
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/posts?type=${isPersonalPosts ? 'personal' : 'all'}&page=${page}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      // Ensure each post has the required fields and parse media data
      const formattedPosts = data.posts.map((post: any) => {
        // Parse media if it's a string
        let mediaData = post.media;
        if (typeof post.media === 'string') {
          try {
            mediaData = JSON.parse(post.media);
          } catch (e) {
            console.error('Error parsing media data:', e);
            mediaData = [];
          }
        }

        return {
          ...post,
          comments: post.comments || [],
          likes: post.likes || 0,
          tags: post.tags || [],
          media: Array.isArray(mediaData) ? mediaData : [],
          timestamp: post.timestamp || new Date(post.createdAt || Date.now()).toLocaleString()
        };
      });
      
      setPosts(prev => page === 1 ? formattedPosts : [...prev, ...formattedPosts]);
      setHasMore(data.pagination.hasMore);
      setPage(prev => data.pagination.hasMore ? prev + 1 : prev);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, isPersonalPosts, hasMore, isLoading]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          fetchPosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchPosts, hasMore, isLoading]);

  // Initial fetch and type change handler
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    fetchPosts();
  }, [isPersonalPosts]);

  const handleTogglePersonalPosts = (isPersonal: boolean) => {
    setIsPersonalPosts(isPersonal);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handlePostCreate = (newPost: Post) => {
    setPosts([newPost, ...posts]);
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
        <div className="flex-1 flex gap-8 max-w-7xl mx-auto px-4">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20">
              <Sidebar
                author={currentUser}
                stats={facultyStats}
                socialLinks={socialLinks}
              />
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 max-w-2xl w-full mx-auto">
            <CreatePost
              currentUser={currentUser}
              onPostCreate={handlePostCreate}
              onTogglePersonalPosts={handleTogglePersonalPosts}
            />
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLike={handleLike}
                  onComment={handleComment}
                  onShare={handleShare}
                />
              ))}
            </div>
            {isLoading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <div ref={observerTarget} className="h-4" />
          </div>

          {/* Right Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-20">
              <RightSidebar 
                messages={messages}
                upcomingClasses={upcomingClasses}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
