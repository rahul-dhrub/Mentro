'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMapPin, FiUsers, FiEdit, FiCalendar, FiBook, FiAward, FiFileText, FiUserPlus, FiStar } from 'react-icons/fi';
import { Author, Post, UserProfile as UserProfileType, Blog } from '../types';
import { mockAuthors, mockPosts, mockPublications } from '../mockData';
import PostCard from './PostCard';
import RatingModal from './RatingModal';
import FollowersModal from './FollowersModal';

interface UserProfileProps {
  userId: string;
  currentUser: Author;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
  onUserSelect?: (userId: string) => void;
  onDelete?: (postId: string) => void;
}

export default function UserProfile({ 
  userId, 
  currentUser, 
  onLike, 
  onComment, 
  onShare,
  onUserSelect,
  onDelete
}: UserProfileProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'publications' | 'blogs' | 'about'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFollowActionLoading, setIsFollowActionLoading] = useState(false);

  // Function to refresh rating data
  const refreshRatingData = async () => {
    if (!userProfile) return;
    
    try {
      const reviewsResponse = await fetch(`/api/users/${userProfile.id}/reviews?limit=1`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setUserProfile(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            averageRating: reviewsData.averageRating || 0,
            totalReviews: reviewsData.totalReviews || 0
          };
        });
      }
    } catch (error) {
      console.error('Error refreshing rating data:', error);
    }
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Fetch user from database first
        let user = null;
        try {
          const userResponse = await fetch(`/api/users/${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            user = {
              id: userData.user._id,
              name: userData.user.name,
              email: userData.user.email,
              title: userData.user.title,
              department: userData.user.department,
              bio: userData.user.bio,
              avatar: userData.user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user.name)}&background=0D8ABC&color=fff`,
              followers: userData.user.followersCount || 0,
              following: userData.user.followingCount || 0,
              posts: 0 // Will be set with real data after fetching posts
            };
          }
        } catch (error) {
          console.error('Error fetching user from database:', error);
        }

        // If database fetch failed, try mock data as fallback
        if (!user) {
          user = mockAuthors.find(author => author.id === userId);
          if (!user) {
            setIsLoading(false);
            return;
          }
        }

        // Get user's posts from database
        let userPosts: Post[] = [];
        let totalPostsCount = 0;
        try {
          const postsResponse = await fetch(`/api/posts?userId=${userId}&limit=20`);
          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            userPosts = postsData.posts || [];
            totalPostsCount = postsData.pagination?.total || userPosts.length;
          } else {
            console.warn(`Posts API returned ${postsResponse.status} for user ${userId}`);
            // Fallback to mock data if API fails
            userPosts = mockPosts.filter(post => post.author.id === userId);
            totalPostsCount = userPosts.length;
          }
        } catch (error) {
          console.error('Error fetching user posts:', error);
          // Fallback to mock data if API fails
          userPosts = mockPosts.filter(post => post.author.id === userId);
          totalPostsCount = userPosts.length;
        }
        
        // If no posts found (neither from database nor mock), create sample posts
        if (userPosts.length === 0 && user) {
          userPosts = [
            {
              id: `${userId}_post_1`,
              author: user,
              content: `Welcome to my profile! I'm excited to share my research and thoughts with the academic community.`,
              media: [],
              likes: Math.floor(Math.random() * 20) + 5,
              comments: [],
              timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleString(),
              tags: ['introduction', 'research']
            },
            {
              id: `${userId}_post_2`,
              author: user,
              content: `Just published a new paper on ${user.department}. Looking forward to discussing the findings with colleagues.`,
              media: [],
              likes: Math.floor(Math.random() * 30) + 10,
              comments: [],
              timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toLocaleString(),
              tags: ['research', 'publication']
            }
          ];
          totalPostsCount = userPosts.length;
        }

        // Update user object with real posts count
        if (user) {
          user.posts = totalPostsCount;
        }
        
        // Get user's publications from API
        let userPublications = [];
        try {
          const publicationsResponse = await fetch(`/api/users/${userId}/publications`);
          if (publicationsResponse.ok) {
            const publicationsData = await publicationsResponse.json();
            userPublications = publicationsData.publications || [];
          } else {
            // Fallback to mock data if API fails
            userPublications = mockPublications.slice(0, 2);
          }
        } catch (error) {
          console.error('Error fetching user publications:', error);
          // Fallback to mock data if API fails
          userPublications = mockPublications.slice(0, 2);
        }

        // Fetch user's blogs from API
        let userBlogs: Blog[] = [];
        try {
          const blogsResponse = await fetch(`/api/blogs?userId=${userId}&limit=20`);
          if (blogsResponse.ok) {
            const blogsData = await blogsResponse.json();
            userBlogs = blogsData.blogs || [];
          } else {
            console.warn(`Blog API returned ${blogsResponse.status} for user ${userId}`);
          }
        } catch (error) {
          console.error('Error fetching user blogs:', error);
          // Fallback to empty array if API fails
          userBlogs = [];
        }

        // Check if current user is following this user
        let isFollowing = false;
        if (user && user.id !== currentUser.id) {
          try {
            const followStatusResponse = await fetch(`/api/users/${userId}/follow-status`);
            if (followStatusResponse.ok) {
              const followStatusData = await followStatusResponse.json();
              isFollowing = followStatusData.isFollowing;
            }
          } catch (error) {
            console.error('Error fetching follow status:', error);
          }
        }

        // Fetch user's rating data
        let averageRating = 0;
        let totalReviews = 0;
        try {
          const reviewsResponse = await fetch(`/api/users/${userId}/reviews?limit=1`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            averageRating = reviewsData.averageRating || 0;
            totalReviews = reviewsData.totalReviews || 0;
          }
        } catch (error) {
          console.error('Error fetching user reviews:', error);
        }

        const profile: UserProfileType = {
          ...user,
          userPosts,
          publications: userPublications,
          blogs: userBlogs,
          isFollowing,
          averageRating,
          totalReviews
        };

        setUserProfile(profile);
        setIsFollowing(isFollowing);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleFollow = () => {
    setShowConfirmModal(true);
  };

  const confirmFollow = async () => {
    if (!userProfile) return;

    setIsFollowActionLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${userProfile.id}/follow`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
        
        // Update the follower count in the profile
        setUserProfile(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            followers: data.followersCount
          };
        });
        
        console.log(data.message);
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData.error);
        alert(errorData.error || 'Failed to update follow status');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setIsFollowActionLoading(false);
      setShowConfirmModal(false);
    }
  };

  const cancelFollow = () => {
    setShowConfirmModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">User Not Found</h2>
        <p className="text-gray-600">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0 mb-4 md:mb-0">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
                <p className="text-lg text-gray-600">{userProfile.title}</p>
                <div className="flex items-center justify-center md:justify-start mt-2 text-gray-500">
                  <FiMapPin size={16} className="mr-1" />
                  <span>{userProfile.department}</span>
                </div>
              </div>

              {/* Follow Button */}
              {userProfile.id !== currentUser.id && (
                <button
                  onClick={handleFollow}
                  className={`mt-4 md:mt-0 px-6 py-1.5 rounded-full font-medium text-sm transition-colors cursor-pointer ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            {/* Bio */}
            {userProfile.bio && (
              <p className="text-gray-700 mb-4">{userProfile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-6 items-start">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiEdit className="w-4 h-4 text-gray-600 mr-1" />
                  <div className="text-xl font-bold text-gray-900">{userProfile.posts}</div>
                </div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors px-1"
                onClick={() => setFollowersModalOpen(true)}
              >
                <div className="flex items-center justify-center mb-1">
                  <FiUsers className="w-4 h-4 text-gray-600 mr-1" />
                  <div className="text-xl font-bold text-gray-900">{userProfile.followers}</div>
                </div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors px-1"
                onClick={() => setFollowingModalOpen(true)}
              >
                <div className="flex items-center justify-center mb-1">
                  <FiUserPlus className="w-4 h-4 text-gray-600 mr-1" />
                  <div className="text-xl font-bold text-gray-900">{userProfile.following}</div>
                </div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
              <div 
                className="text-center cursor-pointer hover:bg-gray-50 rounded-lg transition-colors px-1"
                onClick={() => setIsRatingModalOpen(true)}
                title="View ratings and reviews"
              >
                <div className="flex items-center justify-center mb-1">
                  <FiStar className="w-4 h-4 text-yellow-500 mr-1" />
                  <div className="text-xl font-bold text-gray-900">
                    {userProfile.averageRating ? userProfile.averageRating.toFixed(1) : '0.0'}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Rating {userProfile.totalReviews ? `(${userProfile.totalReviews})` : '(0)'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'posts', label: 'Posts', icon: FiEdit },
              { id: 'publications', label: 'Publications', icon: FiBook },
              { id: 'blogs', label: 'Blogs', icon: FiFileText },
              { id: 'about', label: 'About', icon: FiUsers }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {userProfile.userPosts.length > 0 ? (
              userProfile.userPosts.map((post) => (
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
                  onDelete={onDelete}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <FiEdit className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-500">{userProfile.name} hasn't shared any posts.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'publications' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Publications</h2>
            {userProfile.publications && userProfile.publications.length > 0 ? (
              <div className="space-y-4">
                {userProfile.publications.map((publication) => (
                  <div key={publication.id} className="border-l-4 border-blue-500 pl-4 py-3">
                    <h3 className="font-semibold text-gray-900 mb-1">{publication.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {publication.journal} • {publication.year}
                    </p>
                    {publication.abstract && (
                      <p className="text-sm text-gray-700 mb-2 line-clamp-5 overflow-hidden">{publication.abstract}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Citations: {publication.citationCount}</span>
                      <a
                        href={publication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Read More
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiBook className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No publications</h3>
                <p className="text-gray-500">No publications found for this user.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'blogs' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blogs</h2>
            {userProfile.blogs && userProfile.blogs.length > 0 ? (
              <div className="space-y-4">
                {userProfile.blogs.map((blog) => (
                  <div key={blog.id} className="border-l-4 border-blue-500 pl-4 py-3">
                    <h3 className="font-semibold text-gray-900 mb-1">{blog.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(blog.createdAt).toLocaleDateString()} • {blog.readTime} min read
                    </p>
                    <p className="text-sm text-gray-700 mb-2">{blog.excerpt}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {blog.tags.length > 0 && (
                        <span>Tags: {blog.tags.join(', ')}</span>
                      )}
                      <a
                        href={`/blogs/${blog._id || blog.id}`}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        Read More
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs</h3>
                <p className="text-gray-500">No blogs found for this user.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <p className="text-gray-700">{userProfile.email}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Department</h3>
                <p className="text-gray-700">{userProfile.department}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Title</h3>
                <p className="text-gray-700">{userProfile.title}</p>
              </div>
              {userProfile.bio && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Bio</h3>
                  <p className="text-gray-700">{userProfile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        userId={userProfile.id}
        userName={userProfile.name}
        currentUser={{
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar
        }}
        onReviewsChange={refreshRatingData}
      />

      {/* Followers Modal */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        userId={userProfile.id}
        userName={userProfile.name}
        type="followers"
        onUserSelect={onUserSelect}
      />

      {/* Following Modal */}
      <FollowersModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        userId={userProfile.id}
        userName={userProfile.name}
        type="following"
        onUserSelect={onUserSelect}
      />

      {/* Follow Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isFollowing ? 'Unfollow User' : 'Follow User'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isFollowing 
                ? `Are you sure you want to unfollow ${userProfile.name}? You will no longer see their posts in your feed.`
                : `Are you sure you want to follow ${userProfile.name}? You will start seeing their posts in your feed.`
              }
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelFollow}
                disabled={isFollowActionLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmFollow}
                disabled={isFollowActionLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFollowing
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isFollowActionLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isFollowing ? 'Unfollowing...' : 'Following...'}</span>
                  </div>
                ) : (
                  isFollowing ? 'Unfollow' : 'Follow'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 