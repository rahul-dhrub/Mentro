'use client';

import { useState, useEffect } from 'react';
import { FiHash, FiTrendingUp, FiUsers, FiEdit } from 'react-icons/fi';
import { Post, Author } from '../types';
import { mockPosts, mockHashtags } from '../mockData';
import PostCard from './PostCard';

interface HashtagFeedProps {
  hashtag: string;
  currentUser: Author;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
}

export default function HashtagFeed({ 
  hashtag, 
  currentUser, 
  onLike, 
  onComment, 
  onShare 
}: HashtagFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hashtagInfo, setHashtagInfo] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchHashtagPosts = async () => {
      setIsLoading(true);
      try {
        const hashtagData = mockHashtags.find(h => h.name === hashtag);
        setHashtagInfo(hashtagData);

        const cleanHashtag = hashtag.replace('#', '').toLowerCase();
        const filteredPosts = mockPosts.filter(post => 
          post.tags?.some(tag => tag.toLowerCase().includes(cleanHashtag)) ||
          post.content.toLowerCase().includes(cleanHashtag)
        );

        setPosts(filteredPosts);
        setIsFollowing(Math.random() > 0.5);
      } catch (error) {
        console.error('Error fetching hashtag posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHashtagPosts();
  }, [hashtag]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    console.log(`${isFollowing ? 'Unfollowed' : 'Followed'} ${hashtag}`);
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
              {hashtagInfo && (
                <p className="text-gray-600 mt-1">{hashtagInfo.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiEdit className="mr-1" size={14} />
                  <span>{hashtagInfo?.posts || posts.length} posts</span>
                </div>
                <div className="flex items-center">
                  <FiTrendingUp className="mr-1" size={14} />
                  <span>Trending</span>
                </div>
              </div>
            </div>
          </div>

                  <button
          onClick={handleFollow}
          className={`px-6 py-2 rounded-full font-semibold transition-colors cursor-pointer ${
            isFollowing
              ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h2>
        <div className="flex flex-wrap gap-2">
          {mockHashtags
            .filter(h => h.name !== hashtag)
            .slice(0, 6)
            .map((relatedHashtag) => (
              <button
                key={relatedHashtag.id}
                className="px-3 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors cursor-pointer"
              >
                {relatedHashtag.name}
              </button>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
            />
          ))
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