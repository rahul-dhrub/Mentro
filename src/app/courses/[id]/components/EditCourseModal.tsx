import React, { useState, useRef, useEffect } from 'react';
import { Course } from '../../types';
import { FiUpload, FiX, FiAlertCircle, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { coursesAPI } from '@/lib/api/courses';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (course: Course) => void;
  course: Course;
}

interface CurriculumSection {
  title: string;
  lectures: {
    title: string;
    duration: string;
    type: 'video' | 'reading' | 'quiz' | 'assignment';
    preview?: boolean;
  }[];
}

export default function EditCourseModal({ isOpen, onClose, onSubmit, course }: EditCourseModalProps) {
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
    curriculum: [],
  });

  // Curriculum state
  const [curriculum, setCurriculum] = useState<CurriculumSection[]>([]);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with course data when modal opens or course changes
  useEffect(() => {
    if (isOpen && course) {
      setCourseData({
        title: course.title,
        description: course.description,
        price: course.price,
        originalPrice: course.originalPrice,
        category: course.category,
        level: course.level,
        duration: course.duration,
        thumbnail: course.thumbnail,
        features: course.features.length > 0 ? course.features : [''],
        requirements: course.requirements.length > 0 ? course.requirements : [''],
        whatYouWillLearn: course.whatYouWillLearn.length > 0 ? course.whatYouWillLearn : [''],
        curriculum: course.curriculum || [],
      });

      // Set curriculum state
      if (course.curriculum && course.curriculum.length > 0) {
        const curriculumSections = course.curriculum.map(section => ({
          title: section.title,
          lectures: section.sections[0]?.lectures || []
        }));
        setCurriculum(curriculumSections);
        setShowCurriculum(true);
      } else {
        setCurriculum([]);
        setShowCurriculum(false);
      }

      // Set preview image if course has thumbnail
      setPreviewImage(course.thumbnail || null);
      setError(null);
    }
  }, [isOpen, course]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setPreviewImage(null);
      setIsUploading(false);
      setUploadProgress(0);
      setCurriculum([]);
      setShowCurriculum(false);
      setExpandedSections(new Set());
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

  // Curriculum management functions
  const addCurriculumSection = () => {
    setCurriculum(prev => [...prev, { title: '', lectures: [] }]);
    setExpandedSections(prev => new Set([...prev, curriculum.length]));
  };

  const removeCurriculumSection = (sectionIndex: number) => {
    setCurriculum(prev => prev.filter((_, index) => index !== sectionIndex));
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionIndex);
      // Adjust indices for remaining sections
      const adjustedSet = new Set<number>();
      newSet.forEach(index => {
        if (index < sectionIndex) {
          adjustedSet.add(index);
        } else if (index > sectionIndex) {
          adjustedSet.add(index - 1);
        }
      });
      return adjustedSet;
    });
  };

  const updateSectionTitle = (sectionIndex: number, title: string) => {
    setCurriculum(prev => 
      prev.map((section, index) => 
        index === sectionIndex ? { ...section, title } : section
      )
    );
  };

  const addLecture = (sectionIndex: number) => {
    setCurriculum(prev => 
      prev.map((section, index) => 
        index === sectionIndex 
          ? { 
              ...section, 
              lectures: [...section.lectures, { title: '', duration: '', type: 'video', preview: false }] 
            }
          : section
      )
    );
  };

  const removeLecture = (sectionIndex: number, lectureIndex: number) => {
    setCurriculum(prev => 
      prev.map((section, index) => 
        index === sectionIndex 
          ? { 
              ...section, 
              lectures: section.lectures.filter((_, lIndex) => lIndex !== lectureIndex) 
            }
          : section
      )
    );
  };

  const updateLecture = (sectionIndex: number, lectureIndex: number, field: string, value: any) => {
    setCurriculum(prev => 
      prev.map((section, index) => 
        index === sectionIndex 
          ? { 
              ...section, 
              lectures: section.lectures.map((lecture, lIndex) => 
                lIndex === lectureIndex ? { ...lecture, [field]: value } : lecture
              )
            }
          : section
      )
    );
  };

  const toggleSectionExpanded = (sectionIndex: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionIndex)) {
        newSet.delete(sectionIndex);
      } else {
        newSet.add(sectionIndex);
      }
      return newSet;
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
      // Filter out empty strings from arrays
      const filteredFeatures = courseData.features?.filter(f => f.trim()) || [];
      const filteredRequirements = courseData.requirements?.filter(r => r.trim()) || [];
      const filteredLearning = courseData.whatYouWillLearn?.filter(l => l.trim()) || [];
      
      // Process curriculum data
      const processedCurriculum = curriculum
        .filter(section => section.title.trim()) // Only include sections with titles
        .map(section => {
          const validLectures = section.lectures.filter(lecture => lecture.title.trim()); // Only include lectures with titles
          return {
            title: section.title.trim(),
            lectures: validLectures.length,
            duration: validLectures.reduce((total, lecture) => {
              const duration = lecture.duration.trim();
              // Simple duration parsing - assumes format like "10 min", "1 hour", etc.
              const match = duration.match(/(\d+)/);
              return total + (match ? parseInt(match[1]) : 0);
            }, 0) + ' min', // Convert to minutes string
            sections: [{
              title: section.title.trim(),
              lectures: validLectures
            }]
          };
        });
      
      // Prepare course data for API
      const coursePayload = {
        title: courseData.title!.trim(),
        description: courseData.description!.trim(),
        category: courseData.category!,
        level: courseData.level!,
        duration: courseData.duration!.trim(),
        price: Number(courseData.price),
        originalPrice: courseData.originalPrice ? Number(courseData.originalPrice) : undefined,
        thumbnail: courseData.thumbnail || undefined,
        features: filteredFeatures,
        requirements: filteredRequirements,
        whatYouWillLearn: filteredLearning,
        curriculum: processedCurriculum
      };
      
      // Call API to update course
      const response = await coursesAPI.update(course.id, coursePayload);
      
      if (response.success && response.data) {
        // Success! Call the parent callback and close modal
        onSubmit(response.data);
        onClose();
      } else {
        setError(response.error || 'Failed to update course');
      }
      
    } catch (error) {
      console.error('Error updating course:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
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
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
            <FiAlertCircle className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            
            {/* Curriculum (Optional) */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Curriculum (Optional)</h3>
                <button
                  type="button"
                  onClick={() => setShowCurriculum(!showCurriculum)}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {showCurriculum ? <FiChevronUp className="mr-1" /> : <FiChevronDown className="mr-1" />}
                  {showCurriculum ? 'Hide Curriculum' : 'Edit Curriculum'}
                </button>
              </div>
              
              {showCurriculum && (
                <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-4">
                    Edit sections and lectures for your course. This is optional and can be modified later.
                  </p>
                  
                  {curriculum.map((section, sectionIndex) => (
                    <div key={`section-${sectionIndex}`} className="border border-gray-300 rounded-lg bg-white">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            placeholder="Section title (e.g., Introduction to Programming)"
                            disabled={isSubmitting}
                          />
                          <button
                            type="button"
                            onClick={() => toggleSectionExpanded(sectionIndex)}
                            className="p-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                            disabled={isSubmitting}
                          >
                            {expandedSections.has(sectionIndex) ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCurriculumSection(sectionIndex)}
                            className="p-2 text-red-600 hover:text-red-800 cursor-pointer"
                            disabled={isSubmitting}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                        
                        {expandedSections.has(sectionIndex) && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-700">Lectures</h4>
                              <button
                                type="button"
                                onClick={() => addLecture(sectionIndex)}
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                                disabled={isSubmitting}
                              >
                                <FiPlus className="mr-1" size={14} />
                                Add Lecture
                              </button>
                            </div>
                            
                            {section.lectures.map((lecture, lectureIndex) => (
                              <div key={`lecture-${sectionIndex}-${lectureIndex}`} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-md">
                                <input
                                  type="text"
                                  value={lecture.title}
                                  onChange={(e) => updateLecture(sectionIndex, lectureIndex, 'title', e.target.value)}
                                  className="col-span-5 px-3 py-2 text-sm border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                                  placeholder="Lecture title"
                                  disabled={isSubmitting}
                                />
                                <input
                                  type="text"
                                  value={lecture.duration}
                                  onChange={(e) => updateLecture(sectionIndex, lectureIndex, 'duration', e.target.value)}
                                  className="col-span-2 px-3 py-2 text-sm border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                                  placeholder="10 min"
                                  disabled={isSubmitting}
                                />
                                <select
                                  value={lecture.type}
                                  onChange={(e) => updateLecture(sectionIndex, lectureIndex, 'type', e.target.value)}
                                  className="col-span-2 px-3 py-2 text-sm border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 cursor-pointer"
                                  disabled={isSubmitting}
                                >
                                  <option value="video">Video</option>
                                  <option value="reading">Reading</option>
                                  <option value="quiz">Quiz</option>
                                  <option value="assignment">Assignment</option>
                                </select>
                                <label className="col-span-2 flex items-center text-sm text-gray-700 font-medium">
                                  <input
                                    type="checkbox"
                                    checked={lecture.preview || false}
                                    onChange={(e) => updateLecture(sectionIndex, lectureIndex, 'preview', e.target.checked)}
                                    className="mr-2 w-4 h-4 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500"
                                    disabled={isSubmitting}
                                  />
                                  Preview
                                </label>
                                <button
                                  type="button"
                                  onClick={() => removeLecture(sectionIndex, lectureIndex)}
                                  className="col-span-1 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                                  disabled={isSubmitting}
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addCurriculumSection}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    <FiPlus className="mr-2" />
                    Add Section
                  </button>
                </div>
              )}
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
                  Updating...
                </>
              ) : (
                'Update Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 