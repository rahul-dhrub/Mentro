import React, { useState, useRef, useEffect } from 'react';
import { Course } from '../types';
import { FiUpload, FiX, FiAlertCircle } from 'react-icons/fi';
import { coursesAPI } from '@/lib/api/courses';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Course) => void;
}

interface UserDetails {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  title?: string;
  department?: string;
  role: string;
}

export default function CreateCourseModal({ isOpen, onClose, onSubmit }: CreateCourseModalProps) {
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    level: 'Beginner',
    duration: '',
    thumbnail: '',
    features: [''],
    requirements: [''],
    whatYouWillLearn: [''],
  });

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  // Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user details when modal opens
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isOpen) return;
      
      setIsLoadingUser(true);
      setError(null); // Clear any previous errors when starting to fetch
      try {
        const response = await fetch('/api/user/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserDetails(data.data);
            setError(null); // Clear error on successful fetch
          } else {
            console.error('Failed to fetch user details:', data.error);
            setError('Failed to load instructor information');
          }
        } else {
          console.error('Failed to fetch user details');
          setError('Failed to load instructor information');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load instructor information');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserDetails();
  }, [isOpen]);

  // Reset form and errors when modal is closed/opened
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal is closed
      setCourseData({
        title: '',
        description: '',
        price: 0,
        originalPrice: 0,
        category: '',
        level: 'Beginner',
        duration: '',
        thumbnail: '',
        features: [''],
        requirements: [''],
        whatYouWillLearn: [''],
      });
      setError(null);
      setUserDetails(null);
      setPreviewImage(null);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleArrayChange = (field: 'features' | 'requirements' | 'whatYouWillLearn', index: number, value: string) => {
    setCourseData((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'features' | 'requirements' | 'whatYouWillLearn') => {
    setCourseData((prev) => {
      const newArray = [...(prev[field] || []), ''];
      return { ...prev, [field]: newArray };
    });
  };

  const removeArrayItem = (field: 'features' | 'requirements' | 'whatYouWillLearn', index: number) => {
    setCourseData((prev) => {
      const newArray = [...(prev[field] || [])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload image to bunny.net via our API
    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10); // Start progress
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress during upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Upload to our secure API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      
      // Set the image URL in the course data
      setCourseData((prev) => ({
        ...prev,
        thumbnail: data.url,
      }));
      
      setUploadProgress(100);
      setTimeout(() => setIsUploading(false), 500); // Show 100% briefly
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      alert('Failed to upload image. Please try again.');
    }
  };
  
  const clearImage = () => {
    setPreviewImage(null);
    setCourseData((prev) => ({
      ...prev,
      thumbnail: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateCourseCode = (title: string, category: string): string => {
    // Generate a course code like "DEV001", "BUS002", etc.
    const categoryPrefix = category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-3);
    return `${categoryPrefix}${timestamp}`;
  };

  const validateForm = (): string | null => {
    if (!courseData.title?.trim()) return 'Course title is required';
    if (!courseData.description?.trim()) return 'Course description is required';
    if (!courseData.category) return 'Course category is required';
    if (!courseData.duration?.trim()) return 'Course duration is required';
    if (!courseData.price || courseData.price < 0) return 'Valid price is required';
    
    // Check that at least one feature, requirement, and learning outcome is filled
    const hasFeatures = courseData.features?.some(f => f.trim());
    const hasRequirements = courseData.requirements?.some(r => r.trim());
    const hasLearning = courseData.whatYouWillLearn?.some(l => l.trim());
    
    if (!hasFeatures) return 'At least one feature is required';
    if (!hasRequirements) return 'At least one requirement is required';
    if (!hasLearning) return 'At least one learning outcome is required';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate course code
      const code = generateCourseCode(courseData.title!, courseData.category!);
      
      // Filter out empty strings from arrays
      const filteredFeatures = courseData.features?.filter(f => f.trim()) || [];
      const filteredRequirements = courseData.requirements?.filter(r => r.trim()) || [];
      const filteredLearning = courseData.whatYouWillLearn?.filter(l => l.trim()) || [];
      
      // Prepare course data for API
      const coursePayload = {
        title: courseData.title!.trim(),
        description: courseData.description!.trim(),
        code,
        category: courseData.category!,
        level: courseData.level!,
        duration: courseData.duration!.trim(),
        price: Number(courseData.price),
        originalPrice: courseData.originalPrice ? Number(courseData.originalPrice) : undefined,
        thumbnail: courseData.thumbnail || undefined,
        features: filteredFeatures,
        requirements: filteredRequirements,
        whatYouWillLearn: filteredLearning
      };
      
      // Call API to create course
      const response = await coursesAPI.create(coursePayload);
      
      if (response.success && response.data) {
        // Success! Call the parent callback and close modal
        onSubmit(response.data);
        onClose();
        
        // Reset form
        setCourseData({
          title: '',
          description: '',
          price: 0,
          originalPrice: 0,
          category: '',
          level: 'Beginner',
          duration: '',
          thumbnail: '',
          features: [''],
          requirements: [''],
          whatYouWillLearn: [''],
        });
        setPreviewImage(null);
        
      } else {
        setError(response.error || 'Failed to create course');
      }
      
    } catch (error) {
      console.error('Error creating course:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="border-b p-4 bg-gray-50 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <FiX size={24} />
          </button>
        </div>
        
        {/* Error Message */}
        {error && !userDetails && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <FiAlertCircle className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loading State */}
          {isLoadingUser && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading instructor information...</p>
            </div>
          )}
          
          {/* Instructor Information Display */}
          {userDetails && !isLoadingUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Instructor Information</h3>
              <div className="flex items-center space-x-4">
                <img
                  src={userDetails.profilePicture || 'https://observatory.tec.mx/wp-content/uploads/2020/09/maestroprofesorinstructor.jpg'}
                  alt={userDetails.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-blue-900">{userDetails.name}</p>
                  <p className="text-blue-700 text-sm">{userDetails.title || 'Instructor'}</p>
                  {userDetails.department && (
                    <p className="text-blue-600 text-sm">{userDetails.department}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    placeholder="Enter course title"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    placeholder="Provide a detailed description of your course"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Course Thumbnail</label>
                  <div className="border border-gray-300 rounded-md p-4">
                    {previewImage ? (
                      <div className="relative">
                        <img 
                          src={previewImage} 
                          alt="Course thumbnail preview" 
                          className="w-full h-48 object-cover rounded-md mb-2"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          <FiX size={20} />
                        </button>
                        {isUploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center">
                            <div className="w-full max-w-xs bg-white rounded-md overflow-hidden">
                              <div 
                                className="h-2 bg-blue-600 transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                              <div className="px-3 py-2 text-center text-sm text-gray-800">
                                Uploading... {uploadProgress}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 rounded-md cursor-pointer" 
                        onClick={() => !isSubmitting && fileInputRef.current?.click()}>
                        <FiUpload size={36} className="text-gray-400 mb-2" />
                        <p className="text-gray-500 text-center">
                          Click to upload thumbnail image
                          <br />
                          <span className="text-sm">Recommended size: 1280x720px</span>
                        </p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    
                    {courseData.thumbnail && (
                      <div className="mt-2 text-sm text-gray-600 truncate">
                        <span className="font-medium">Uploaded URL:</span> {courseData.thumbnail}
                      </div>
                    )}
                    
                    {!isUploading && previewImage && !courseData.thumbnail && (
                      <button
                        type="button"
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                      >
                        Change image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Course Details */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Course Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Category *</label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 cursor-pointer"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select a category</option>
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Music">Music</option>
                    <option value="Science">Science</option>
                    <option value="Art">Art</option>
                    <option value="Language">Language</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Level *</label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 cursor-pointer"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    placeholder="e.g., 45 hours"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Pricing</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={courseData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Original price (for discounts)"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Features *</h3>
              
              {courseData.features?.map((feature, index) => (
                <div key={`feature-${index}`} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayChange('features', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Lifetime access"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('features', index)}
                    className="p-2 text-red-600 hover:text-red-800 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={courseData.features?.length === 1 || isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('features')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className="mr-1 text-lg">+</span> Add Feature
              </button>
            </div>
            
            {/* Requirements */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Requirements *</h3>
              
              {courseData.requirements?.map((requirement, index) => (
                <div key={`requirement-${index}`} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Basic computer knowledge"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="p-2 text-red-600 hover:text-red-800 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={courseData.requirements?.length === 1 || isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className="mr-1 text-lg">+</span> Add Requirement
              </button>
            </div>
            
            {/* What You Will Learn */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">What You Will Learn *</h3>
              
              {courseData.whatYouWillLearn?.map((item, index) => (
                <div key={`learn-${index}`} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Build responsive websites"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('whatYouWillLearn', index)}
                    className="p-2 text-red-600 hover:text-red-800 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={courseData.whatYouWillLearn?.length === 1 || isSubmitting}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('whatYouWillLearn')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className="mr-1 text-lg">+</span> Add Learning Outcome
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-5 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 font-medium text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-base flex items-center gap-2 ${
                (isUploading || isSubmitting) ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
              }`}
              disabled={isUploading || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 