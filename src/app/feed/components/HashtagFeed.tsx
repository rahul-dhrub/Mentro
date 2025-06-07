'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiHash, FiTrendingUp, FiUsers, FiEdit } from 'react-icons/fi';
import { Post, Author } from '../types';
import PostCard from './PostCard';

interface HashtagFeedProps {
  hashtag: string;
  currentUser: Author;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onUserSelect?: (userId: string) => void;
}

interface HashtagInfo {
  name: string;
  description: string;
  followers: number;
  posts: number;
  category: string;
}

export default function HashtagFeed({ 
  hashtag, 
  currentUser, 
  onLike, 
  onComment, 
  onShare,
  onUserSelect
}: HashtagFeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
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

  useEffect(() => {
    const loadHashtagData = async () => {
      await fetchHashtagData();
      // Check follow status after hashtag data is loaded
      await checkFollowStatus();
    };
    
    loadHashtagData();
  }, [hashtag]);

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
      
      setHashtagInfo(data.hashtag);
      setPagination(data.pagination);
      
    } catch (error) {
      console.error('Error fetching hashtag posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load hashtag posts');
      
      // Fallback to empty state for new hashtags
      if (error instanceof Error && error.message.includes('doesn\'t exist')) {
        setHashtagInfo({
          name: hashtag,
          description: `Posts tagged with ${hashtag}`,
          followers: 0,
          posts: 0,
          category: 'general'
        });
        setPosts([]);
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
                  <span>{hashtagInfo?.posts || 0} posts</span>
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
      </div>
    </div>
  );
} 