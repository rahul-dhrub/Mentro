'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  FiEdit2, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiAward, 
  FiBook, 
  FiUsers, 
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiStar,
  FiSearch,
  FiFilter,
  FiUpload,
  FiCamera,
  FiVideo
} from 'react-icons/fi';
import CourseCard from './components/CourseCard';
import CourseFilters from './components/CourseFilters';

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
  role: 'student' | 'faculty' | 'admin';
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAchievements, setIsEditingAchievements] = useState(false);
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
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

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000); // Hide after 5 seconds
  };

  // Mock user data - in a real app, this would come from your user API
  useEffect(() => {
    const mockUser: UserProfile = {
      id: '1',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@mentro.edu',
      phone: '+1 (555) 123-4567',
      role: 'faculty',
      title: 'Professor of Computer Science',
      bio: 'Passionate educator and researcher with over 10 years of experience in computer science education. Specializing in artificial intelligence, machine learning, and software engineering. Committed to helping students develop both technical skills and critical thinking abilities.',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=774&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      location: 'San Francisco, CA',
      joinDate: '2020-01-15',
      dateOfBirth: '1985-03-20',
      expertise: [
        'Artificial Intelligence',
        'Machine Learning',
        'Software Engineering',
        'Data Science',
        'Python',
        'JavaScript',
        'React',
        'Node.js'
      ],
      achievements: [
        'Outstanding Teaching Award 2023',
        'Published 15+ Research Papers',
        'Google AI Research Grant Recipient',
        'Top-rated Instructor (4.9/5)',
        'Mentored 200+ Students',
        'Conference Speaker at 10+ Events'
      ],
      introVideo: 'https://iframe.mediadelivery.net/embed/424950/0612db34-fd6b-45d3-bd45-8f4bc6dcd4a7',
      social: {
        github: 'https://github.com/sarahchen',
        linkedin: 'https://linkedin.com/in/sarahchen',
        website: 'https://sarahchen.dev'
      },
      stats: {
        totalCourses: 12,
        totalStudents: 2500,
        averageRating: 4.9,
        totalHours: 1800
      },
      recentActivity: [
        {
          id: '1',
          type: 'course_created',
          title: 'Advanced Machine Learning',
          date: '2024-02-15',
          description: 'Created a new course on advanced machine learning techniques'
        },
        {
          id: '2',
          type: 'achievement_earned',
          title: 'Outstanding Teaching Award',
          date: '2024-02-10',
          description: 'Received the Outstanding Teaching Award for exceptional student feedback'
        },
        {
          id: '3',
          type: 'course_completed',
          title: 'Student John Doe completed AI Fundamentals',
          date: '2024-02-08',
          description: 'Student successfully completed the AI Fundamentals course with 95% score'
        }
      ]
    };
    setUser(mockUser);

    // Mock courses data for faculty
    if (mockUser.role === 'faculty') {
      const mockCourses: Course[] = [
        {
          id: "1",
          title: "Introduction to Machine Learning",
          description: "Learn the fundamentals of machine learning algorithms and their applications.",
          thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          students: 1200,
          rating: 4.8,
          price: 49.99,
          category: "Machine Learning"
        },
        {
          id: "2",
          title: "Advanced Python Programming",
          description: "Master Python programming with advanced concepts and best practices.",
          thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          students: 800,
          rating: 4.7,
          price: 39.99,
          category: "Programming"
        },
        {
          id: "3",
          title: "Deep Learning Fundamentals",
          description: "Explore the world of deep learning and neural networks.",
          thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          students: 600,
          rating: 4.9,
          price: 59.99,
          category: "Deep Learning"
        },
        {
          id: "4",
          title: "Data Science Bootcamp",
          description: "Comprehensive course covering all aspects of data science.",
          thumbnail: "https://images.unsplash.com/photo-1681005002301-f22cb7f2341b?q=80&w=1972&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          students: 1500,
          rating: 4.6,
          price: 79.99,
          category: "Data Science"
        }
      ];
      setCourses(mockCourses);
    }
  }, []);

  // Filter courses for faculty - must be called in same order every render
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
      // Use the existing bunny-storage API endpoint to get upload credentials
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
      
      // Now upload the file directly to Bunny CDN
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
      // Use the existing bunny-upload API endpoint for video streaming
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
      
      // Upload the video file directly to Bunny CDN
      const uploadResponse = await fetch(uploadUrl, {
        method: httpMethod,
        headers: headers,
        body: file,
      });
      
      if (!uploadResponse.ok) {
        // Try to clean up the failed upload
        try {
          await fetch(`/api/bunny-upload?guid=${guid}`, { method: 'DELETE' });
        } catch (cleanupError) {
          console.error('Failed to clean up failed upload:', cleanupError);
        }
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      
      // Return the Bunny CDN iframe embed URL
      return `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}`;
    } catch (error) {
      console.error('Failed to upload video:', error);
      throw error;
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPG, PNG, WebP, GIF)', 'error');
      return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showToast('Image file size must be less than 5MB', 'error');
      return;
    }
    
    try {
      const imageUrl = await uploadImageToBunny(file);
      setUser(prev => prev ? {...prev, profileImage: imageUrl} : null);
      showToast('Profile image updated successfully!', 'success');
      // Clear the input to allow re-uploading the same file
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToast(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      // Clear the input on error too
      event.target.value = '';
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      showToast('Please select a video file (MP4, WebM, AVI, MOV, etc.)', 'error');
      return;
    }
    
    // Validate file size (max 100MB for videos)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      showToast('Video file size must be less than 100MB', 'error');
      return;
    }
    
    try {
      const videoUrl = await uploadVideoToBunny(file);
      setUser(prev => prev ? {...prev, introVideo: videoUrl} : null);
      setIsEditingVideo(false);
      showToast('Introduction video uploaded successfully!', 'success');
      // Clear the input to allow re-uploading
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload video:', error);
      showToast(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      // Clear the input on error too
      event.target.value = '';
    }
  };

  // Helper function to check if URL is a Bunny CDN iframe embed
  const isBunnyIframeEmbed = (url: string): boolean => {
    return url.includes('iframe.mediadelivery.net/embed/') || url.includes('iframe.bunnycdn.com/embed/');
  };

  // Helper function to check if URL is a direct video file
  const isDirectVideoUrl = (url: string): boolean => {
    return /\.(mp4|webm|ogg|avi|mov|wmv|flv|m4v)(\?.*)?$/i.test(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative">
        <div className="relative h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-purple-900/60" />
          <Image
            src={user.bannerImage}
            alt="Profile banner"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Profile Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Profile Image */}
                <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-blue-500 overflow-hidden bg-gray-200 shadow-lg flex-shrink-0 group">
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    fill
                    className="object-cover"
                    priority
                  />
                  
                  {/* Upload Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label htmlFor="profile-image-upload" className={`cursor-pointer ${isUploadingImage ? 'pointer-events-none' : ''}`}>
                      <div className="flex flex-col items-center text-white">
                        {isUploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                            <span className="text-xs">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <FiCamera size={24} />
                            <span className="text-xs mt-1">Change Photo</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {/* Hidden File Input */}
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </div>

                {/* Profile Info - Left Side */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="p-2 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                      title="Edit Profile"
                    >
                      <FiEdit2 size={20} />
                    </button>
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
                          onClick={() => setIsEditingProfile(false)}
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
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
                          <FiMail className="text-blue-600" size={16} />
                          <span className="text-gray-800 text-sm font-medium">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
                          <FiPhone className="text-green-600" size={16} />
                          <span className="text-gray-800 text-sm font-medium">{user.phone}</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
                          <FiMapPin className="text-red-600" size={16} />
                          <span className="text-gray-800 text-sm font-medium">{user.location}</span>
                        </div>
                        <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
                          <FiCalendar className="text-purple-600" size={16} />
                          <span className="text-gray-800 text-sm font-medium">Joined {formatDate(user.joinDate)}</span>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex justify-center lg:justify-start gap-4 mb-6">
                        {user.social.github && (
                          <a
                            href={user.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white transition-colors shadow-md"
                          >
                            <FiGithub size={16} />
                            <span className="text-sm font-medium">GitHub</span>
                          </a>
                        )}
                        {user.social.linkedin && (
                          <a
                            href={user.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors shadow-md"
                          >
                            <FiLinkedin size={16} />
                            <span className="text-sm font-medium">LinkedIn</span>
                          </a>
                        )}
                        {user.social.website && (
                          <a
                            href={user.social.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors shadow-md"
                          >
                            <FiGlobe size={16} />
                            <span className="text-sm font-medium">Website</span>
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Stats - Right Side */}
                <div className="lg:ml-8">
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 text-center lg:text-right">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
                      <p className="text-2xl font-bold text-blue-700">{user.stats.totalCourses}</p>
                      <p className="text-sm text-blue-600 font-medium">Courses</p>
                    </div>
                    {user.stats.totalStudents && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow-sm">
                        <p className="text-2xl font-bold text-green-700">{user.stats.totalStudents}</p>
                        <p className="text-sm text-green-600 font-medium">Students</p>
                      </div>
                    )}
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-center lg:justify-end gap-1 mb-1">
                        <FiStar className="text-yellow-500 fill-current" size={16} />
                        <span className="text-2xl font-bold text-yellow-700">{user.stats.averageRating}</span>
                      </div>
                      <p className="text-sm text-yellow-600 font-medium">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'achievements', ...(user.role === 'faculty' ? ['courses'] : [])].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Content Area */}
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Intro Video Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Introduction Video</h2>
                    <button
                      onClick={() => setIsEditingVideo(!isEditingVideo)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16} />
                      {isEditingVideo ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                                     {isEditingVideo ? (
                     <div className="space-y-4">
                       <div className="space-y-4">
                         {/* Upload Video Option */}
                         <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                           <label htmlFor="video-upload" className="cursor-pointer">
                             <div className="flex flex-col items-center">
                               {isUploadingVideo ? (
                                 <>
                                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                   <p className="text-lg font-medium text-gray-900 mb-2">Uploading Video...</p>
                                   <p className="text-sm text-gray-600">This may take a few minutes depending on file size</p>
                                 </>
                               ) : (
                                 <>
                                   <FiUpload className="text-gray-400 mb-4" size={48} />
                                   <p className="text-lg font-medium text-gray-900 mb-2">Upload Video</p>
                                   <p className="text-sm text-gray-500 mb-4">
                                     Click to upload or drag and drop your video file
                                   </p>
                                   <div className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                     <FiVideo className="inline mr-2" size={16} />
                                     Select Video File
                                   </div>
                                 </>
                               )}
                             </div>
                           </label>
                           <input
                             id="video-upload"
                             type="file"
                             accept="video/*"
                             onChange={handleVideoUpload}
                             className="hidden"
                             disabled={isUploadingVideo}
                           />
                         </div>

                         {/* Or enter URL directly */}
                         <div className="relative">
                           <div className="absolute inset-0 flex items-center">
                             <div className="w-full border-t border-gray-300" />
                           </div>
                           <div className="relative flex justify-center text-sm">
                             <span className="px-2 bg-white text-gray-500">Or enter video URL</span>
                           </div>
                         </div>

                         <div className="space-y-2">
                           <label className="block text-sm font-medium text-gray-700">
                             Video URL (Bunny CDN embed or direct video)
                           </label>
                           <input
                             type="url"
                             value={user.introVideo || ''}
                             onChange={(e) => {
                               setUser(prev => prev ? {...prev, introVideo: e.target.value} : null);
                             }}
                             placeholder="https://iframe.mediadelivery.net/embed/424950/your-video-id"
                             className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                           />
                           <div className="text-xs text-gray-500 space-y-1">
                             <p><strong>Bunny CDN Embed:</strong> https://iframe.mediadelivery.net/embed/424950/your-video-id</p>
                             <p><strong>Direct Video:</strong> https://your-bunny-zone.b-cdn.net/videos/your-video.mp4</p>
                             <p>Both Bunny CDN iframe embeds and direct video URLs are supported</p>
                           </div>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button
                           onClick={() => setIsEditingVideo(false)}
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                         >
                           Save
                         </button>
                         <button
                           onClick={() => setIsEditingVideo(false)}
                           className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                         >
                           Cancel
                         </button>
                       </div>
                     </div>
                  ) : (
                                         <div className="relative w-full">
                       {user.introVideo ? (
                         <>
                           <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                             {isBunnyIframeEmbed(user.introVideo) ? (
                               // Use iframe for Bunny CDN embeds
                               <iframe
                                 src={user.introVideo}
                                 title="Introduction Video"
                                 className="w-full h-full border-0"
                                 allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                                 allowFullScreen
                               />
                             ) : isDirectVideoUrl(user.introVideo) ? (
                               // Use video element for direct video files
                               <video
                                 src={user.introVideo}
                                 title="Introduction Video"
                                 className="w-full h-full object-cover"
                                 controls
                                 preload="metadata"
                                 poster={user.profileImage}
                               >
                                 Your browser does not support the video tag.
                               </video>
                             ) : (
                               // Fallback for other video URLs (try iframe first, then video)
                               <iframe
                                 src={user.introVideo}
                                 title="Introduction Video"
                                 className="w-full h-full border-0"
                                 allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                                 allowFullScreen
                                 onError={(e) => {
                                   // If iframe fails, try video element
                                   const target = e.target as HTMLIFrameElement;
                                   const video = document.createElement('video');
                                   video.src = user.introVideo!;
                                   video.controls = true;
                                   video.className = "w-full h-full object-cover";
                                   target.parentNode?.replaceChild(video, target);
                                 }}
                               />
                             )}
                           </div>
                           <p className="text-sm text-gray-600 mt-3">
                             Watch this introduction video to learn more about my teaching approach and experience.
                           </p>
                         </>
                       ) : (
                         <div className="aspect-video w-full rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                           <div className="text-center">
                             <FiVideo className="mx-auto text-gray-400 mb-3" size={48} />
                             <p className="text-gray-500 mb-2">No introduction video added yet</p>
                             <button
                               onClick={() => setIsEditingVideo(true)}
                               className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                             >
                               <FiUpload size={16} />
                               Add Video
                             </button>
                           </div>
                         </div>
                       )}
                     </div>
                  )}
                </div>

                {/* About Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">About</h2>
                    <button
                      onClick={() => setIsEditingOverview(!isEditingOverview)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16} />
                      {isEditingOverview ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  {isEditingOverview ? (
                    <div className="space-y-4">
                      <textarea
                        value={user.bio}
                        onChange={(e) => setUser(prev => prev ? {...prev, bio: e.target.value} : null)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                        placeholder="Write about yourself..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingOverview(false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingOverview(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  )}
                </div>

                {/* Expertise Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Expertise</h2>
                    <button
                      onClick={() => setIsEditingOverview(!isEditingOverview)}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit2 size={16} />
                      Edit
                    </button>
                  </div>
                  {isEditingOverview ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {user.expertise.map((skill, index) => (
                          <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            <span>{skill}</span>
                            <button
                              onClick={() => {
                                const newExpertise = user.expertise.filter((_, i) => i !== index);
                                setUser(prev => prev ? {...prev, expertise: newExpertise} : null);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add new skill..."
                          className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                          onKeyPress={(e) => {
                            const target = e.target as HTMLInputElement;
                            if (e.key === 'Enter' && target.value.trim()) {
                              const newSkill = target.value.trim();
                              setUser(prev => prev ? {...prev, expertise: [...prev.expertise, newSkill]} : null);
                              target.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={() => setIsEditingOverview(false)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
                  <button
                    onClick={() => setIsEditingAchievements(!isEditingAchievements)}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit2 size={16} />
                    {isEditingAchievements ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {isEditingAchievements ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {user.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <FiAward className="text-yellow-500 flex-shrink-0" size={20} />
                          <input
                            type="text"
                            value={achievement}
                            onChange={(e) => {
                              const newAchievements = [...user.achievements];
                              newAchievements[index] = e.target.value;
                              setUser(prev => prev ? {...prev, achievements: newAchievements} : null);
                            }}
                            className="flex-1 p-2 border-0 focus:ring-0 focus:outline-none bg-transparent text-gray-900 font-medium"
                          />
                          <button
                            onClick={() => {
                              const newAchievements = user.achievements.filter((_, i) => i !== index);
                              setUser(prev => prev ? {...prev, achievements: newAchievements} : null);
                            }}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add new achievement..."
                        className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
                        onKeyPress={(e) => {
                          const target = e.target as HTMLInputElement;
                          if (e.key === 'Enter' && target.value.trim()) {
                            const newAchievement = target.value.trim();
                            setUser(prev => prev ? {...prev, achievements: [...prev.achievements, newAchievement]} : null);
                            target.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => setIsEditingAchievements(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border border-gray-100 rounded-lg">
                        <FiAward className="text-yellow-500 mt-1 flex-shrink-0" size={20} />
                        <span className="text-gray-800">{achievement}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && user.role === 'faculty' && (
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
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white hover:text-gray-200 font-bold text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}