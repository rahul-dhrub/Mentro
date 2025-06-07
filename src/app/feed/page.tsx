'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { FiX, FiArrowLeft } from 'react-icons/fi';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Navbar from './components/Navbar';
import PublicationsModal from './components/PublicationsModal';
import SearchBar from './components/SearchBar';
import UserProfile from './components/UserProfile';
import HashtagFeed from './components/HashtagFeed';
import RatingModal from './components/RatingModal';
import FollowersModal from './components/FollowersModal';
import { Post, Author, Publication } from './types';
import { mockAuthors, mockPublications } from './mockData';


export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isPersonalPosts, setIsPersonalPosts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [animationData, setAnimationData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<Author>({
    ...mockAuthors[0],
    title: mockAuthors[0].title || 'Faculty Member'
  });
  const observerTarget = useRef<HTMLDivElement>(null);
  const { userId, isLoaded, isSignedIn } = useAuth();
  const [isPublicationsModalOpen, setIsPublicationsModalOpen] = useState(false);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [followersModalType, setFollowersModalType] = useState<'followers' | 'following'>('followers');
  
  // Sidebar stats state
  const [sidebarStats, setSidebarStats] = useState({
    followers: 0,
    following: 0,
    rating: 0,
    blogs: 0,
    publications: 0,
  });

  // Search-related state
  const [viewMode, setViewMode] = useState<'feed' | 'user' | 'hashtag'>('feed');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Fetch sidebar stats for current user
  const fetchSidebarStats = async (userIdToQuery: string) => {
    try {
      // Fetch user data with followers/following counts
      const userResponse = await fetch(`/api/users/${userIdToQuery}`, {
        credentials: 'include'
      });
      
      let userFollowersCount = 0;
      let userFollowingCount = 0;
      if (userResponse.ok) {
        const userData = await userResponse.json();
        userFollowersCount = userData.user?.followersCount || 0;
        userFollowingCount = userData.user?.followingCount || 0;
      }

      // Fetch user's rating data
      let averageRating = 0;
      try {
        const reviewsResponse = await fetch(`/api/users/${userIdToQuery}/reviews?limit=1`, {
          credentials: 'include'
        });
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          averageRating = reviewsData.averageRating || 0;
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      }

      // Fetch user's blogs count
      let blogsCount = 0;
      try {
        const blogsResponse = await fetch(`/api/blogs?userId=${userIdToQuery}&limit=1`, {
          credentials: 'include'
        });
        if (blogsResponse.ok) {
          const blogsData = await blogsResponse.json();
          blogsCount = blogsData.pagination?.total || 0;
        }
      } catch (error) {
        console.error('Error fetching user blogs:', error);
      }

      // Update sidebar stats
      setSidebarStats({
        followers: userFollowersCount,
        following: userFollowingCount,
        rating: averageRating,
        blogs: blogsCount,
        publications: publications.length, // Keep current publications count
      });

    } catch (error) {
      console.error('Error fetching sidebar stats:', error);
      // Keep default stats on error
    }
  };

  // Fetch current user data
  useEffect(() => {
    if (isLoaded && isSignedIn && userId) {
      // Fetch user profile from our database
      fetch(`/api/users/profile?clerkId=${userId}`, {
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }
          return response.json();
        })
        .then(data => {
          if (data.user) {
            const userData = {
              id: data.user._id || data.user.id,
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.profilePicture,
              title: data.user.title || 'Faculty Member',
              department: data.user.department || 'Computer Science'
            };
            setCurrentUser(userData);
            
            // Fetch sidebar stats for this user
            fetchSidebarStats(userData.id);
          }
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          // Keep using mock data if fetch fails
        });
    }
  }, [isLoaded, isSignedIn, userId]);

  // Load animation data from public folder
  useEffect(() => {
    // Fetch animation data from public folder
    fetch('/animation.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  const fetchPosts = useCallback(async (pageNum = page) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      // Check if we've already seen a 404 error - to prevent continuous calls
      const localStorageKey = 'postsApiErrorTime';
      const lastErrorTime = localStorage.getItem(localStorageKey);
      
      // If we've had an error in the last 30 seconds, don't try again
      if (lastErrorTime && Date.now() - parseInt(lastErrorTime) < 30000) {
        console.log('Skipping API call due to recent error');
        // Use mock data instead
        import('./mockData').then(({ mockPosts }) => {
          const startIndex = (pageNum - 1) * 10;
          const endIndex = pageNum * 10;
          
          // Filter mock posts by current user if personal posts are selected
          const filteredPosts = isPersonalPosts 
            ? mockPosts.filter(post => post.author.id === currentUser.id)
            : mockPosts;
          
          const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
          setPosts(prev => pageNum === 1 ? paginatedPosts : [...prev, ...paginatedPosts]);
          setHasMore(endIndex < filteredPosts.length);
          setIsLoading(false);
        });
        return; // Don't throw, just return to prevent the error block
      }

      // Build API URL for personal posts - no need to pass userId for personal posts
      // as the API will use the authenticated user's MongoDB _id automatically
      const apiUrl = isPersonalPosts 
        ? `/api/posts?type=personal&page=${pageNum}&limit=10`
        : `/api/posts?type=all&page=${pageNum}&limit=10`;

      const response = await fetch(apiUrl, {
        credentials: 'include'
      });

      if (!response.ok) {
        // Record the time of the error
        localStorage.setItem(localStorageKey, Date.now().toString());
        
        // Fall back to mock data when the API fails
        console.log('API error, using mock data');
        import('./mockData').then(({ mockPosts }) => {
          const startIndex = (page - 1) * 10;
          const endIndex = page * 10;
          
          // Filter mock posts by current user if personal posts are selected
          const filteredPosts = isPersonalPosts 
            ? mockPosts.filter(post => post.author.id === currentUser.id)
            : mockPosts;
          
          const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
          setPosts(prev => pageNum === 1 ? paginatedPosts : [...prev, ...paginatedPosts]);
          setHasMore(endIndex < filteredPosts.length);
          setIsLoading(false);
        });
        return; // Don't throw, just return to prevent the error block
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

      setPosts(prev => pageNum === 1 ? formattedPosts : [...prev, ...formattedPosts]);
      setHasMore(data.pagination.hasMore);
      // Only increment page if there are more pages and we're not on the last page
      if (data.pagination.hasMore) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isPersonalPosts, hasMore, isLoading, currentUser.id]);

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
    // Call fetchPosts with explicit page 1
    fetchPosts(1);
  }, [isPersonalPosts]);

  // Search handlers
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedHashtag(null);
    setViewMode('user');
    setIsSearchActive(true);
  };

  const handleHashtagSelect = (hashtag: string) => {
    setSelectedHashtag(hashtag);
    setSelectedUserId(null);
    setViewMode('hashtag');
    setIsSearchActive(true);
  };

  const handleBackToFeed = () => {
    setViewMode('feed');
    setSelectedUserId(null);
    setSelectedHashtag(null);
    setIsSearchActive(false);
  };

  const handleTogglePersonalPosts = (isPersonal: boolean) => {
    setIsPersonalPosts(isPersonal);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handlePostCreate = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = async (postId: string) => {
    // Find and optimistically update the post immediately
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const wasLiked = post.isLikedByCurrentUser;
          return {
            ...post,
            isLikedByCurrentUser: !wasLiked,
            likes: wasLiked ? post.likes - 1 : post.likes + 1
          };
        }
        return post;
      })
    );

    try {
      // API call happens in the background - the UI is already updated
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to toggle post like');
      }

      const data = await response.json();
      
      // Update with the accurate server response
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              isLikedByCurrentUser: data.liked,
              likes: data.likesCount
            };
          }
          return post;
        })
      );

    } catch (error) {
      console.error('Error toggling post like:', error);
      
      // Revert the optimistic update on error
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const currentLiked = post.isLikedByCurrentUser;
            return {
              ...post,
              isLikedByCurrentUser: !currentLiked,
              likes: currentLiked ? post.likes - 1 : post.likes + 1
            };
          }
          return post;
        })
      );
    }
  };

  const handleComment = (postId: string, content: string) => {
    const newComment = {
      id: Date.now().toString(),
      author: currentUser,
      content,
      timestamp: new Date().toLocaleString(),
      likes: 0
    };

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  const handleShare = (postId: string) => {
    console.log('Shared post:', postId);
  };

  const handleRatingClick = () => {
    setIsRatingModalOpen(true);
  };

  const handleFollowersClick = () => {
    setFollowersModalType('followers');
    setIsFollowersModalOpen(true);
  };

  const handleFollowingClick = () => {
    setFollowersModalType('following');
    setIsFollowersModalOpen(true);
  };

  const handleFollowersCountChange = (newCount: number, type: 'followers' | 'following') => {
    setSidebarStats(prev => ({
      ...prev,
      [type]: newCount
    }));
  };

  // Publications handling
  const fetchPublications = async () => {
    try {
      const response = await fetch('/api/publications', {
        credentials: 'include'
      });
      if (!response.ok) {
        console.log('API error, using mock publications');
        setPublications(mockPublications);
        setSidebarStats(prev => ({
          ...prev,
          publications: mockPublications.length
        }));
        return;
      }
      const data = await response.json();
      const publicationsList = data.publications || [];
      setPublications(publicationsList);
      
      // Update sidebar stats with publications count
      setSidebarStats(prev => ({
        ...prev,
        publications: publicationsList.length
      }));
    } catch (error) {
      console.error('Error fetching publications:', error);
      setPublications(mockPublications);
      setSidebarStats(prev => ({
        ...prev,
        publications: mockPublications.length
      }));
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleAddPublication = async (newPublication: Omit<Publication, 'id'>) => {
    try {
      const response = await fetch('/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newPublication),
      });

      if (!response.ok) {
        throw new Error('Failed to add publication');
      }

      const data = await response.json();
      setPublications(prev => {
        const newList = [data.publication, ...prev];
        // Update sidebar stats
        setSidebarStats(prevStats => ({
          ...prevStats,
          publications: newList.length
        }));
        return newList;
      });
      return { success: true, publication: data.publication };
    } catch (error) {
      console.error('Error adding publication:', error);
      const mockPublication = {
        id: Date.now().toString(),
        ...newPublication
      };
      setPublications(prev => {
        const newList = [mockPublication, ...prev];
        // Update sidebar stats
        setSidebarStats(prevStats => ({
          ...prevStats,
          publications: newList.length
        }));
        return newList;
      });
      return { success: true, publication: mockPublication };
    }
  };

  const handleDeletePublication = async (publicationId: string) => {
    try {
      const response = await fetch(`/api/publications/${publicationId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // If it's an invalid ObjectId (mock data), just remove it from the frontend
        if (errorData.error?.includes('Invalid publication ID format')) {
          console.log('Removing mock publication from frontend only');
          setPublications(prev => {
            const newList = prev.filter(pub => pub.id !== publicationId);
            // Update sidebar stats
            setSidebarStats(prevStats => ({
              ...prevStats,
              publications: newList.length
            }));
            return newList;
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to delete publication');
      }

      setPublications(prev => {
        const newList = prev.filter(pub => pub.id !== publicationId);
        // Update sidebar stats
        setSidebarStats(prevStats => ({
          ...prevStats,
          publications: newList.length
        }));
        return newList;
      });
    } catch (error) {
      console.error('Error deleting publication:', error);
      
      // For network errors or other issues, still try to remove from frontend
      if (error instanceof Error && error.message.includes('fetch')) {
        console.log('Network error, removing from frontend only');
        setPublications(prev => {
          const newList = prev.filter(pub => pub.id !== publicationId);
          // Update sidebar stats
          setSidebarStats(prevStats => ({
            ...prevStats,
            publications: newList.length
          }));
          return newList;
        });
      } else {
        alert(`Failed to delete publication: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  // Render different views based on search state
  const renderMainContent = () => {
    if (viewMode === 'user' && selectedUserId) {
      return (
        <UserProfile
          userId={selectedUserId}
          currentUser={currentUser}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onUserSelect={handleUserSelect}
        />
      );
    }

    if (viewMode === 'hashtag' && selectedHashtag) {
      return (
        <HashtagFeed
          hashtag={selectedHashtag}
          currentUser={currentUser}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      );
    }

    // Default feed view
    return (
      <>
        <CreatePost 
          currentUser={currentUser} 
          onPostCreate={handlePostCreate}
          onTogglePersonalPosts={handleTogglePersonalPosts}
          isPersonalPosts={isPersonalPosts}
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
          
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading more posts...</p>
              </div>
            </div>
          )}
          
          <div ref={observerTarget} className="h-4" />
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar 
        user={{
          name: currentUser.name,
          avatar: currentUser.avatar,
          title: currentUser.title || 'Faculty Member'
        }} 
        onSidebarToggle={toggleSidebar} 
        isSidebarVisible={isSidebarVisible}
        onUserSelect={handleUserSelect}
        onHashtagSelect={handleHashtagSelect}
        isSearchActive={isSearchActive}
        setIsSearchActive={setIsSearchActive}
        onBackToFeed={handleBackToFeed}
      />
      
      <div className="pt-16 flex max-w-7xl mx-auto">
        {/* Left Sidebar - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:block w-80 flex-shrink-0">
          <div className="sticky top-20 h-[calc(100vh-80px)] overflow-y-auto pr-2">
            <Sidebar
              author={currentUser}
              stats={sidebarStats}
              socialLinks={{
                email: currentUser.email,
                linkedin: 'https://linkedin.com/in/example',
                twitter: 'https://twitter.com/example',
              }}
              onShowPublications={() => setIsPublicationsModalOpen(true)}
              onRatingClick={handleRatingClick}
              onFollowersClick={handleFollowersClick}
              onFollowingClick={handleFollowingClick}
            />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarVisible && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop - Only covers the area to the right of sidebar */}
            <div 
              className="fixed left-80 top-16 right-0 bottom-0 bg-black bg-opacity-20 cursor-pointer"
              onClick={toggleSidebar}
            ></div>
            
            {/* Sidebar Content */}
            <div className="fixed left-0 top-16 bottom-0 w-80 bg-white shadow-xl overflow-y-auto border-r border-gray-200">
              {/* Sidebar Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  title="Close Sidebar"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="p-4">
                {/* Mobile Search Bar */}
                <div className="mb-6">
                  <SearchBar
                    onUserSelect={(userId) => {
                      handleUserSelect(userId);
                      toggleSidebar(); // Close sidebar after selection
                    }}
                    onHashtagSelect={(hashtag) => {
                      handleHashtagSelect(hashtag);
                      toggleSidebar(); // Close sidebar after selection
                    }}
                    isSearchActive={isSearchActive}
                    setIsSearchActive={setIsSearchActive}
                  />
                </div>
                
                <Sidebar
                  author={currentUser}
                  stats={sidebarStats}
                  socialLinks={{
                    email: currentUser.email,
                    linkedin: 'https://linkedin.com/in/example',
                    twitter: 'https://twitter.com/example',
                  }}
                  onShowPublications={() => setIsPublicationsModalOpen(true)}
                  onRatingClick={handleRatingClick}
                  onFollowersClick={handleFollowersClick}
                  onFollowingClick={handleFollowingClick}
                />
              </div>
            </div>
          </div>
        )}
        
        <main className="flex-1 p-6">
          {renderMainContent()}
        </main>
        
        <div className="hidden lg:block w-96 flex-shrink-0">
          <div className="sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
            <RightSidebar 
              upcomingClasses={[
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
                }
              ]}
              messages={[
                {
                  id: '1',
                  sender: {
                    name: 'Dr. Michael Chen',
                    avatar: mockAuthors[1].avatar
                  },
                  content: 'Can we discuss the research proposal tomorrow?',
                  time: '5m ago',
                  unread: true
                },
                {
                  id: '2',
                  sender: {
                    name: 'Dr. Emily Rodriguez',
                    avatar: mockAuthors[2].avatar
                  },
                  content: 'The workshop materials are ready for review.',
                  time: '1h ago',
                  unread: false
                }
              ]}
            />
          </div>
        </div>
      </div>

      <PublicationsModal
        isOpen={isPublicationsModalOpen}
        onClose={() => setIsPublicationsModalOpen(false)}
        publications={publications}
        onAddPublication={handleAddPublication}
        onDeletePublication={handleDeletePublication}
      />

      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        userId={currentUser.id}
        userName={currentUser.name}
        currentUser={{
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        }}
        showGiveRatingTab={false}
        onReviewsChange={() => {
          // Refresh sidebar stats when reviews change
          fetchSidebarStats(currentUser.id);
        }}
      />

      <FollowersModal
        isOpen={isFollowersModalOpen}
        onClose={() => setIsFollowersModalOpen(false)}
        userId={currentUser.id}
        userName={currentUser.name}
        type={followersModalType}
        currentUserId={currentUser.id}
        onCountChange={(newCount) => {
          handleFollowersCountChange(newCount, followersModalType);
        }}
        onUserSelect={handleUserSelect}
      />
    </div>
  );
}
