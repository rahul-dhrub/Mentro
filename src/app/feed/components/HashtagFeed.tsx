'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiHash, FiTrendingUp, FiUsers, FiEdit, FiFileText, FiExternalLink } from 'react-icons/fi';
import { Post, Author } from '../types';
import PostCard from './PostCard';

interface HashtagFeedProps {
  hashtag: string;
  currentUser: Author;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onUserSelect?: (userId: string) => void;
  onDelete?: (postId: string) => void;
}

interface HashtagInfo {
  name: string;
  description: string;
  followers: number;
  posts: number;
  blogs: number;
  category: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  tags: string[];
  readTime: number;
  createdAt: string;
  hashtagNames: string[];
}

export default function HashtagFeed({ 
  hashtag, 
  currentUser, 
  onLike, 
  onComment, 
  onShare,
  onUserSelect,
  onDelete
}: HashtagFeedProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'posts' | 'blogs'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hashtagInfo, setHashtagInfo] = useState<HashtagInfo | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  });
  const [blogPagination, setBlogPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  });

  useEffect(() => {
    const loadHashtagData = async () => {
      // Load both posts and blogs when hashtag changes
      await Promise.all([
        fetchHashtagData(),
        fetchHashtagBlogs()
      ]);
      // Check follow status after hashtag data is loaded
      await checkFollowStatus();
    };
    
    loadHashtagData();
  }, [hashtag]);

  // Separate effect for tab changes (no need to reload data)
  useEffect(() => {
    // Tab switching doesn't require data reload since both are already loaded
  }, [activeTab]);

  const fetchHashtagData = async (page = 1) => {
      setIsLoading(true);
    setError(null);
    
    try {
      // Encode the hashtag for URL
      const encodedHashtag = encodeURIComponent(hashtag);
      
      // Fetch posts for this hashtag
      const response = await fetch(`/api/hashtags/${encodedHashtag}/posts?page=${page}&limit=10`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('This hashtag doesn\'t exist yet. Be the first to use it!');
        }
        throw new Error('Failed to fetch hashtag posts');
      }

      const data = await response.json();
      
      // Format posts to match the expected structure
      const formattedPosts = data.posts.map((post: any) => ({
        id: post._id,
        author: {
          id: post.author.id,
          name: post.author.name,
          email: post.author.email,
          avatar: post.author.avatar,
          title: 'Faculty Member', // Default title
          department: 'Academic' // Default department
        },
        content: post.content,
        media: post.media || [],
        likes: post.likesCount || (post.likedBy ? post.likedBy.length : 0),
        comments: [], // Comments are loaded separately
        timestamp: new Date(post.createdAt).toLocaleString(),
        tags: post.tags || [],
        isLikedByCurrentUser: post.likedBy ? post.likedBy.includes(currentUser.id) : false
      }));

      if (page === 1) {
        setPosts(formattedPosts);
      } else {
        setPosts(prev => [...prev, ...formattedPosts]);
      }
      
      // Update hashtag info with correct posts count from the database
      setHashtagInfo({
        ...data.hashtag,
        posts: data.pagination.total // Use the total count from pagination
      });
      setPagination(data.pagination);
      
      } catch (error) {
        console.error('Error fetching hashtag posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load hashtag posts');
      
      // Fallback to empty state for new hashtags
      if (error instanceof Error && error.message.includes('doesn\'t exist')) {
        setHashtagInfo(prev => prev ? {
          ...prev,
          posts: 0
        } : {
          name: hashtag,
          description: `Posts tagged with ${hashtag}`,
          followers: 0,
          posts: 0,
          blogs: 0,
          category: 'general'
        });
        setPosts([]);
      }
      } finally {
        setIsLoading(false);
      }
    };

  const fetchHashtagBlogs = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Encode the hashtag for URL
      const encodedHashtag = encodeURIComponent(hashtag);
      
      // Fetch blogs for this hashtag
      const response = await fetch(`/api/hashtags/${encodedHashtag}/blogs?page=${page}&limit=10`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('This hashtag doesn\'t have any blogs yet.');
        }
        throw new Error('Failed to fetch hashtag blogs');
      }

      const data = await response.json();
      
      // Debug the received data
      console.log(`HashtagFeed received data for ${hashtag}:`);
      console.log(`- Blogs received: ${data.blogs.length}`);
      console.log(`- Hashtag data:`, data.hashtag);
      console.log(`- Pagination data:`, data.pagination);
      console.log(`- Using blogs count: ${data.pagination.total}`);
      
      if (page === 1) {
        setBlogs(data.blogs);
      } else {
        setBlogs(prev => [...prev, ...data.blogs]);
      }
      
      // Update hashtag info with correct blogs count from the database
      // Use the larger of: pagination total, blogIds length, or actual blogs loaded
      const actualBlogsCount = Math.max(
        data.pagination.total || 0,
        data.blogs.length,
        (page === 1 ? 0 : blogs.length) + data.blogs.length // Total loaded blogs
      );
      
      const updatedHashtagInfo = {
        ...data.hashtag,
        blogs: actualBlogsCount
      };
      console.log(`Updating hashtagInfo:`, updatedHashtagInfo);
      console.log(`Counts - pagination.total: ${data.pagination.total}, blogs.length: ${data.blogs.length}, calculated: ${actualBlogsCount}`);
      setHashtagInfo(updatedHashtagInfo);
      setBlogPagination(data.pagination);
      
    } catch (error) {
      console.error('Error fetching hashtag blogs:', error);
      setError(error instanceof Error ? error.message : 'Failed to load hashtag blogs');
      
      // Fallback to empty state for hashtags without blogs
      if (error instanceof Error && error.message.includes('doesn\'t have any blogs')) {
        setBlogs([]);
        // Update hashtagInfo to reflect 0 blogs if there's an error finding blogs
        setHashtagInfo(prev => prev ? {
          ...prev,
          blogs: 0
        } : {
          name: hashtag,
          description: `Content tagged with ${hashtag}`,
          followers: 0,
          posts: 0,
          blogs: 0,
          category: 'general'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const encodedHashtag = encodeURIComponent(hashtag);
      const response = await fetch(`/api/hashtags/${encodedHashtag}/follow`);
      
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        
        // Update follower count if hashtag info exists
        if (hashtagInfo) {
          setHashtagInfo({
            ...hashtagInfo,
            followers: data.followersCount
          });
        }
      } else {
        // If there's an error or user is not authenticated, default to not following
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      const encodedHashtag = encodeURIComponent(hashtag);
      const response = await fetch(`/api/hashtags/${encodedHashtag}/follow`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        
        // Update follower count in hashtag info
        if (hashtagInfo) {
          setHashtagInfo({
            ...hashtagInfo,
            followers: data.followersCount
          });
        }
        
        // Show user-friendly message
        const action = data.isFollowing ? 'following' : 'unfollowed';
        console.log(`Successfully ${action} ${hashtag}`);
        
        // Optional: Show a toast notification here
        // toast.success(data.message);
        
      } else {
        const errorData = await response.json();
        console.error('Failed to toggle follow status:', errorData.error);
      }
          } catch (error) {
        console.error('Error toggling follow status:', error);
      } finally {
        setIsFollowLoading(false);
      }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error && !hashtagInfo) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <FiHash className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Hashtag</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchHashtagData()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FiHash className="text-blue-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hashtag}</h1>
              {hashtagInfo?.description && (
                <p className="text-gray-600 mt-1">{hashtagInfo.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiEdit className="mr-1" size={14} />
                  <span>
                    {isLoading && activeTab === 'posts' ? 'Loading...' : `${hashtagInfo?.posts || 0} posts`}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiFileText className="mr-1" size={14} />
                  <span>
                    {isLoading ? 'Loading...' : `${hashtagInfo?.blogs || blogs.length || 0} blogs`}
                  </span>
                </div>
                <div className="flex items-center">
                  <FiUsers className="mr-1" size={14} />
                  <span>{hashtagInfo?.followers || 0} followers</span>
                </div>
                <div className="flex items-center">
                  <FiTrendingUp className="mr-1" size={14} />
                  <span className="capitalize">{hashtagInfo?.category || 'general'}</span>
                </div>
              </div>
            </div>
          </div>

                  <button
          onClick={handleFollow}
            disabled={isFollowLoading}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              isFollowLoading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isFollowing
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
          }`}
        >
            {isFollowLoading 
              ? 'Loading...' 
              : isFollowing 
                ? 'Following' 
                : 'Follow'
            }
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FiEdit size={16} />
                <span>Posts ({isLoading ? '...' : hashtagInfo?.posts || 0})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blogs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FiFileText size={16} />
                <span>Blogs ({isLoading ? '...' : hashtagInfo?.blogs || blogs.length || 0})</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h2>
        <div className="flex flex-wrap gap-2">
          {['#research', '#science', '#education', '#technology', '#innovation', '#academic'].filter(tag => tag !== hashtag).slice(0, 6).map((relatedTag) => (
              <button
              key={relatedTag}
              onClick={() => router.push(`/feed/hashtag/${encodeURIComponent(relatedTag)}`)}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors cursor-pointer"
              >
              {relatedTag}
              </button>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Posts Tab Content */}
        {activeTab === 'posts' && (
          <>
        {posts.length > 0 ? (
              <>
                {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
              onDelete={onDelete}
              onUserSelect={onUserSelect}
              onHashtagSelect={(hashtag) => {
                // Navigate to the selected hashtag using Next.js router
                const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
                router.push(`/feed/hashtag/${encodeURIComponent(cleanHashtag)}`);
              }}
            />
                ))}
                
                {pagination.hasMore && (
                  <div className="flex justify-center py-6">
                    <button
                      onClick={() => fetchHashtagData(pagination.currentPage + 1)}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Loading...' : 'Load More Posts'}
                    </button>
                  </div>
                )}
              </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FiHash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500">
              No posts found with the hashtag {hashtag}. Be the first to post!
            </p>
          </div>
            )}
          </>
        )}

        {/* Blogs Tab Content */}
        {activeTab === 'blogs' && (
          <>
            {blogs.length > 0 ? (
              <>
                {blogs.map((blog) => (
                  <div key={blog._id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3';
                        }}
                      />
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => window.open(`/blogs/${blog._id}`, '_blank')}
                          className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                        >
                          <FiExternalLink size={16} className="text-gray-700" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <img
                          src={blog.author.avatar}
                          alt={blog.author.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{blog.author.name}</p>
                          <p className="text-xs text-gray-500">{new Date(blog.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="ml-auto text-xs text-gray-500 flex items-center">
                          <FiFileText size={12} className="mr-1" />
                          {blog.readTime} min read
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{blog.excerpt}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {blog.hashtagNames.map((tag, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
                                router.push(`/feed/hashtag/${encodeURIComponent(cleanTag)}`);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {blogPagination.hasMore && (
                  <div className="flex justify-center py-6">
                    <button
                      onClick={() => fetchHashtagBlogs(blogPagination.currentPage + 1)}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Loading...' : 'Load More Blogs'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-500">
                  No blogs found with the hashtag {hashtag}. Be the first to write!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 