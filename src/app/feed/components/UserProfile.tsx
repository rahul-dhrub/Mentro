'use client';

import { useState, useEffect } from 'react';
import { FiMapPin, FiUsers, FiEdit, FiCalendar, FiBook, FiAward, FiFileText, FiUserPlus } from 'react-icons/fi';
import { Author, Post, UserProfile as UserProfileType, Blog } from '../types';
import { mockAuthors, mockPosts, mockPublications } from '../mockData';
import PostCard from './PostCard';

interface UserProfileProps {
  userId: string;
  currentUser: Author;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
}

export default function UserProfile({ 
  userId, 
  currentUser, 
  onLike, 
  onComment, 
  onShare 
}: UserProfileProps) {
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'publications' | 'blogs' | 'about'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Find user in mock data
        const user = mockAuthors.find(author => author.id === userId);
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get user's posts
        const userPosts = mockPosts.filter(post => post.author.id === userId);
        
        // Get user's publications
        const userPublications = mockPublications.slice(0, 2); // Mock user publications

        // Fetch user's blogs from API
        let userBlogs: Blog[] = [];
        try {
          const blogsResponse = await fetch(`/api/blogs?userId=${userId}`);
          if (blogsResponse.ok) {
            const blogsData = await blogsResponse.json();
            userBlogs = blogsData.blogs || [];
          }
        } catch (error) {
          console.error('Error fetching user blogs:', error);
          // Fallback to empty array if API fails
          userBlogs = [];
        }

        const profile: UserProfileType = {
          ...user,
          userPosts,
          publications: userPublications,
          blogs: userBlogs,
          isFollowing: Math.random() > 0.5 // Random following status for demo
        };

        setUserProfile(profile);
        setIsFollowing(profile.isFollowing || false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Here you would typically make an API call
    console.log(`${isFollowing ? 'Unfollowed' : 'Followed'} ${userProfile?.name}`);
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
                  className={`mt-4 md:mt-0 px-6 py-1.5 rounded-full font-medium text-sm transition-colors ${
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
            <div className="flex justify-center md:justify-start space-x-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiEdit className="w-4 h-4 text-gray-600 mr-1" />
                  <div className="text-xl font-bold text-gray-900">{userProfile.posts}</div>
                </div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiUsers className="w-4 h-4 text-gray-600 mr-1" />
                  <div className="text-xl font-bold text-gray-900">{userProfile.followers}</div>
                </div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <FiUserPlus className="w-4 h-4 text-gray-600 mr-1" />
                  <div className="text-xl font-bold text-gray-900">{userProfile.following}</div>
                </div>
                <div className="text-sm text-gray-500">Following</div>
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
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
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
                      <p className="text-sm text-gray-700 mb-2">{publication.abstract}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Citations: {publication.citationCount}</span>
                      <a
                        href={publication.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
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
                        className="text-blue-600 hover:text-blue-800"
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
    </div>
  );
} 