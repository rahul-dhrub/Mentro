'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiEdit2, FiArrowLeft } from 'react-icons/fi';
import CourseCard from './components/CourseCard';
import CourseFilters from './components/CourseFilters';
import ProfileStats from './components/ProfileStats';
import ContactInfo from './components/ContactInfo';
import SocialLinks from './components/SocialLinks';
import ProfileImageUpload from './components/ProfileImageUpload';
import BannerImageUpload from './components/BannerImageUpload';
import IntroVideoSection from './components/IntroVideoSection';
import AboutSection from './components/AboutSection';
import ExpertiseSection from './components/ExpertiseSection';
import AchievementsSection from './components/AchievementsSection';
import ToastNotification from './components/ToastNotification';
import TabNavigation from './components/TabNavigation';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  students: number;
  rating: number;
  price: number;
  category: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'student' | 'instructor' | 'admin';
  title: string;
  bio: string;
  profileImage: string;
  bannerImage: string;
  location: string;
  joinDate: string;
  dateOfBirth: string;
  expertise: string[];
  achievements: string[];
  introVideo?: string;
  social: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  stats: {
    totalCourses: number;
    totalStudents?: number;
    completedCourses?: number;
    inProgressCourses?: number;
    averageRating: number;
    totalHours: number;
    totalReviews?: number;
  };
  recentActivity: {
    id: string;
    type: 'course_completed' | 'course_created' | 'assignment_submitted' | 'achievement_earned';
    title: string;
    date: string;
    description: string;
  }[];
}

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const isViewingOtherUser = !!userId;
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAchievements, setIsEditingAchievements] = useState(false);
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'courses'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    rating: 0,
    priceRange: [0, 1000],
    students: 0,
  });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Hide after 5 seconds
  };

  // Save profile data to database
  const saveProfile = async (updatedData: Partial<UserProfile>) => {
    // Prevent saving when viewing other user's profile
    if (isViewingOtherUser) {
      showToast('Cannot edit other users profiles', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save profile');
      }

      const data = await response.json();
      setUser(data.profile);
      showToast('Profile saved successfully!', 'success');
      return data.profile;
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(`Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  };

  // Fetch user data from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        let response;
        if (userId) {
          // Fetch specific user profile
          response = await fetch(`/api/users/${userId}`);
        } else {
          // Fetch current user profile
          response = await fetch('/api/profile');
        }
        
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response formats
        let profile;
        if (userId) {
          // API response for specific user has user data in 'user' field
          const userData = data.user;
          profile = {
            id: userData._id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            role: userData.role,
            title: userData.title,
            bio: userData.bio || '',
            profileImage: userData.profilePicture || '',
            bannerImage: userData.bannerImage || '',
            location: userData.location || '',
            joinDate: userData.joinDate || userData.createdAt,
            dateOfBirth: userData.dateOfBirth || '',
            expertise: userData.expertise || [],
            achievements: userData.achievements || [],
            introVideo: userData.introVideo || '',
            social: userData.social || { github: '', linkedin: '', website: '' },
            stats: {
              totalCourses: userData.stats?.totalCourses || 0,
              totalStudents: userData.stats?.totalStudents || 0,
              completedCourses: userData.stats?.completedCourses || 0,
              inProgressCourses: userData.stats?.inProgressCourses || 0,
              averageRating: userData.stats?.averageRating || 0,
              totalHours: userData.stats?.totalHours || 0,
            },
            recentActivity: userData.recentActivity || []
          };
        } else {
          // Current user profile response
          profile = data.profile;
        }
        
        setUser(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        showToast('Failed to load profile data', 'error');
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Fetch courses data for faculty
  useEffect(() => {
    const fetchCourses = async () => {
      if (user && user.role === 'instructor') {
        try {
          let response;
          if (userId) {
            // Fetch courses for specific user
            response = await fetch(`/api/users/${userId}/courses`);
          } else {
            // Fetch courses for current user
            response = await fetch('/api/profile/courses');
          }
          
          if (response.ok) {
            const data = await response.json();
            setCourses(data.courses);
          } else {
            console.error('Failed to fetch courses:', response.status);
            setCourses([]);
          }
        } catch (error) {
          console.error('Error fetching courses:', error);
          setCourses([]);
        }
      }
    };

    fetchCourses();
  }, [user, userId]);

  // Fetch students data for instructor and update stats
  useEffect(() => {
    const fetchStudentsData = async () => {
      if (user && user.role === 'instructor') {
        try {
          setIsLoadingStudents(true);
          let response;
          
          if (userId) {
            // Fetch stats for specific user
            response = await fetch(`/api/users/${userId}/stats`);
          } else {
            // Fetch stats for current user
            response = await fetch('/api/instructor/students');
          }
          
          if (response.ok) {
            const data = await response.json();
            
            // Update user stats with real students count
            setUser(prevUser => {
              if (!prevUser) return null;
              
              return {
                ...prevUser,
                stats: {
                  ...prevUser.stats,
                  totalStudents: data.totalStudents || 0,
                  totalCourses: data.totalCourses || 0,
                  averageRating: data.averageRating || 0,
                  totalHours: data.totalHours || 0
                }
              };
            });
          } else {
            console.error('Failed to fetch students data:', response.status);
            if (!userId) { // Only show error for current user
              showToast('Failed to load students data', 'error');
            }
          }
        } catch (error) {
          console.error('Error fetching students data:', error);
          if (!userId) { // Only show error for current user
            showToast('Error loading students data', 'error');
          }
        } finally {
          setIsLoadingStudents(false);
        }
      }
    };

    fetchStudentsData();
  }, [user?.id, userId]);

  // Fetch rating data for other users
  useEffect(() => {
    const fetchRatingData = async () => {
      if (userId && user) {
        try {
          const response = await fetch(`/api/users/${userId}/reviews?limit=1`);
          if (response.ok) {
            const data = await response.json();
            
            // Update user stats with rating data
            setUser(prevUser => {
              if (!prevUser) return null;
              
              return {
                ...prevUser,
                stats: {
                  ...prevUser.stats,
                  averageRating: data.averageRating || 0,
                  totalReviews: data.totalReviews || 0
                }
              };
            });
          }
        } catch (error) {
          console.error('Error fetching rating data:', error);
        }
      }
    };

    fetchRatingData();
  }, [userId, user?.id]);

  // Filter courses for faculty
  const categories = useMemo(() => Array.from(new Set(courses.map(course => course.category))), [courses]);
  
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || course.category === selectedCategory;
      const matchesRating = course.rating >= filters.rating;
      const matchesPrice = course.price >= filters.priceRange[0] && course.price <= filters.priceRange[1];
      const matchesStudents = course.students >= filters.students;

      return matchesSearch && matchesCategory && matchesRating && matchesPrice && matchesStudents;
    });
  }, [courses, searchQuery, selectedCategory, filters]);

  // Upload functions
  const uploadImageToBunny = async (file: File): Promise<string> => {
    setIsUploadingImage(true);
    try {
      const response = await fetch('/api/bunny-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initialize upload');
      }
      
      const { uploadUrl, downloadUrl, headers, httpMethod } = await response.json();
      
      const uploadResponse = await fetch(uploadUrl, {
        method: httpMethod,
        headers: headers,
        body: file,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      return downloadUrl;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const uploadVideoToBunny = async (file: File): Promise<string> => {
    setIsUploadingVideo(true);
    try {
      const initResponse = await fetch('/api/bunny-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${user?.name || 'User'} - Introduction Video`,
          filename: file.name
        }),
      });
      
      if (!initResponse.ok) {
        const error = await initResponse.json();
        throw new Error(error.error || 'Failed to initialize video upload');
      }
      
      const { uploadUrl, httpMethod, headers, guid, libraryId } = await initResponse.json();
      
      const uploadResponse = await fetch(uploadUrl, {
        method: httpMethod,
        headers: headers,
        body: file,
      });
      
      if (!uploadResponse.ok) {
        try {
          await fetch(`/api/bunny-upload?guid=${guid}`, { method: 'DELETE' });
        } catch (cleanupError) {
          console.error('Failed to clean up failed upload:', cleanupError);
        }
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      return `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw error;
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewingOtherUser) return;
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPG, PNG, WebP, GIF)', 'error');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('Image file size must be less than 5MB', 'error');
      return;
    }
    
    try {
      const imageUrl = await uploadImageToBunny(file);
      await saveProfile({ profileImage: imageUrl });
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToast(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      event.target.value = '';
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewingOtherUser) return;
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPG, PNG, WebP, GIF)', 'error');
      return;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB for banner
    if (file.size > maxSize) {
      showToast('Banner image file size must be less than 10MB', 'error');
      return;
    }
    
    try {
      setIsUploadingBanner(true);
      const imageUrl = await uploadImageToBunny(file);
      await saveProfile({ bannerImage: imageUrl });
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload banner:', error);
      showToast(`Failed to upload banner: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      event.target.value = '';
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isViewingOtherUser) return;
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      showToast('Please select a video file (MP4, WebM, AVI, MOV, etc.)', 'error');
      return;
    }
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      showToast('Video file size must be less than 100MB', 'error');
      return;
    }
    
    try {
      const videoUrl = await uploadVideoToBunny(file);
      await saveProfile({ introVideo: videoUrl });
      setIsEditingVideo(false);
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload video:', error);
      showToast(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      event.target.value = '';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative">
        <BannerImageUpload
          bannerImage={user.bannerImage}
          isUploading={isUploadingBanner}
          onImageUpload={handleBannerUpload}
          disabled={isViewingOtherUser}
        />
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm border border-white/30 hover:bg-white/95 rounded-full transition-colors shadow-lg"
          title="Go Back"
        >
          <FiArrowLeft size={20} className="text-gray-700" />
        </button>

        {/* Profile Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <ProfileImageUpload
                    profileImage={user.profileImage}
                    userName={user.name}
                    isUploading={isUploadingImage}
                    onImageUpload={handleImageUpload}
                    disabled={isViewingOtherUser}
                  />
                  {!isViewingOtherUser && (
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      title="Edit Profile"
                    >
                      <FiEdit2 size={16} />
                      Edit Info
                    </button>
                  )}
                </div>

                {/* Profile Info - Left Side */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  </div>
                  <p className="text-xl text-blue-600 font-semibold mb-6">{user.title}</p>

                  {isEditingProfile ? (
                    /* Edit Mode */
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Name</label>
                          <input
                            type="text"
                            value={user.name}
                            onChange={(e) => setUser(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Title</label>
                          <input
                            type="text"
                            value={user.title}
                            onChange={(e) => setUser(prev => prev ? {...prev, title: e.target.value} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={user.email}
                            onChange={(e) => setUser(prev => prev ? {...prev, email: e.target.value} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Phone</label>
                          <input
                            type="tel"
                            value={user.phone}
                            onChange={(e) => setUser(prev => prev ? {...prev, phone: e.target.value} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Location</label>
                          <input
                            type="text"
                            value={user.location}
                            onChange={(e) => setUser(prev => prev ? {...prev, location: e.target.value} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                        </div>
                      </div>
                      
                      {/* Social Links Editing */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Social Links</label>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="url"
                            placeholder="GitHub URL"
                            value={user.social.github || ''}
                            onChange={(e) => setUser(prev => prev ? {...prev, social: {...prev.social, github: e.target.value}} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                          <input
                            type="url"
                            placeholder="LinkedIn URL"
                            value={user.social.linkedin || ''}
                            onChange={(e) => setUser(prev => prev ? {...prev, social: {...prev.social, linkedin: e.target.value}} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                          <input
                            type="url"
                            placeholder="Website URL"
                            value={user.social.website || ''}
                            onChange={(e) => setUser(prev => prev ? {...prev, social: {...prev.social, website: e.target.value}} : null)}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            try {
                              await saveProfile({
                                name: user.name,
                                title: user.title,
                                email: user.email,
                                phone: user.phone,
                                location: user.location,
                                social: user.social
                              });
                              setIsEditingProfile(false);
                            } catch (error) {
                              // Error handled in saveProfile
                            }
                          }}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditingProfile(false)}
                          className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <>
                      <ContactInfo
                        email={user.email}
                        phone={user.phone}
                        location={user.location}
                        joinDate={user.joinDate}
                      />
                      <SocialLinks social={user.social} />
                    </>
                  )}
                </div>

                {/* Stats - Right Side */}
                <ProfileStats
                  stats={user.stats}
                  userRole={user.role}
                  isLoadingStudents={isLoadingStudents}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <TabNavigation
          activeTab={activeTab}
          userRole={user.role}
          onTabChange={setActiveTab}
        />

        <div className="max-w-4xl mx-auto">
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <IntroVideoSection
                introVideo={user.introVideo}
                profileImage={user.profileImage}
                isEditing={isEditingVideo}
                isUploading={isUploadingVideo}
                onToggleEdit={() => setIsEditingVideo(!isEditingVideo)}
                onVideoChange={(value) => setUser(prev => prev ? {...prev, introVideo: value} : null)}
                onVideoUpload={handleVideoUpload}
                onSave={async () => {
                  try {
                    await saveProfile({ introVideo: user.introVideo });
                    setIsEditingVideo(false);
                  } catch (error) {
                    // Error handled in saveProfile
                  }
                }}
                onCancel={() => setIsEditingVideo(false)}
                showEditButton={!isViewingOtherUser}
              />

              <AboutSection
                bio={user.bio}
                isEditing={isEditingOverview}
                onToggleEdit={() => setIsEditingOverview(!isEditingOverview)}
                onBioChange={(value) => setUser(prev => prev ? {...prev, bio: value} : null)}
                onSave={async () => {
                  try {
                    await saveProfile({ bio: user.bio });
                    setIsEditingOverview(false);
                  } catch (error) {
                    // Error handled in saveProfile
                  }
                }}
                onCancel={() => setIsEditingOverview(false)}
                showEditButton={!isViewingOtherUser}
              />

              <ExpertiseSection
                expertise={user.expertise}
                isEditing={isEditingOverview}
                onToggleEdit={() => setIsEditingOverview(!isEditingOverview)}
                onExpertiseChange={(expertise) => setUser(prev => prev ? {...prev, expertise} : null)}
                onSave={async () => {
                  try {
                    await saveProfile({ expertise: user.expertise });
                    setIsEditingOverview(false);
                  } catch (error) {
                    // Error handled in saveProfile
                  }
                }}
                onCancel={() => setIsEditingOverview(false)}
                showEditButton={!isViewingOtherUser}
              />
            </div>
          )}

          {activeTab === 'achievements' && (
            <AchievementsSection
              achievements={user.achievements}
              isEditing={isEditingAchievements}
              onToggleEdit={() => setIsEditingAchievements(!isEditingAchievements)}
              onAchievementsChange={(achievements) => setUser(prev => prev ? {...prev, achievements} : null)}
              onSave={async () => {
                try {
                  await saveProfile({ achievements: user.achievements });
                  setIsEditingAchievements(false);
                } catch (error) {
                  // Error handled in saveProfile
                }
              }}
              onCancel={() => setIsEditingAchievements(false)}
              showEditButton={!isViewingOtherUser}
            />
          )}

          {activeTab === 'courses' && user.role === 'instructor' && (
            <div className="space-y-6">
              <CourseFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                categories={categories}
                isFilterModalOpen={isFilterModalOpen}
                onFilterModalToggle={() => setIsFilterModalOpen(!isFilterModalOpen)}
                filters={filters}
                onFiltersChange={setFilters}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-800">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}