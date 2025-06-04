import React, { useState, useRef } from 'react';
import { Course } from '../types';
import { FiUpload, FiX } from 'react-icons/fi';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: Partial<Course>) => void;
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

  // Image upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add missing required fields with default values
    const newCourse: Partial<Course> = {
      ...courseData,
      instructor: {
        name: 'Current Instructor',
        image: 'https://placekitten.com/100/100', // Placeholder
        rating: 5.0,
        reviews: 0
      },
      rating: 0,
      reviews: 0,
      students: 0,
      lastUpdated: new Date(),
      curriculum: []
    };
    
    onSubmit(newCourse);
    onClose();
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
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Course Title</label>
                  <input
                    type="text"
                    name="title"
                    value={courseData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    placeholder="Enter course title"
                  />
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={courseData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    placeholder="Provide a detailed description of your course"
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
                        onClick={() => fileInputRef.current?.click()}>
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
                  <label className="block text-base font-medium text-gray-800 mb-1">Category</label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 cursor-pointer"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Music">Music</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Level</label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 cursor-pointer"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                    placeholder="e.g., 45 hours"
                  />
                </div>
              </div>
            </div>
            
            {/* Pricing */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Pricing</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-base font-medium text-gray-800 mb-1">Price ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={courseData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
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
                  />
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Features</h3>
              
              {courseData.features?.map((feature, index) => (
                <div key={`feature-${index}`} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleArrayChange('features', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Lifetime access"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('features', index)}
                    className="p-2 text-red-600 hover:text-red-800 font-medium cursor-pointer"
                    disabled={courseData.features?.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('features')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer"
              >
                <span className="mr-1 text-lg">+</span> Add Feature
              </button>
            </div>
            
            {/* Requirements */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Requirements</h3>
              
              {courseData.requirements?.map((requirement, index) => (
                <div key={`requirement-${index}`} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Basic computer knowledge"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="p-2 text-red-600 hover:text-red-800 font-medium cursor-pointer"
                    disabled={courseData.requirements?.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('requirements')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer"
              >
                <span className="mr-1 text-lg">+</span> Add Requirement
              </button>
            </div>
            
            {/* What You Will Learn */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">What You Will Learn</h3>
              
              {courseData.whatYouWillLearn?.map((item, index) => (
                <div key={`learn-${index}`} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange('whatYouWillLearn', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="e.g., Build responsive websites"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('whatYouWillLearn', index)}
                    className="p-2 text-red-600 hover:text-red-800 font-medium cursor-pointer"
                    disabled={courseData.whatYouWillLearn?.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addArrayItem('whatYouWillLearn')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer"
              >
                <span className="mr-1 text-lg">+</span> Add Learning Outcome
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-5 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-800 hover:bg-gray-100 font-medium text-base cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-base ${
                isUploading ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              disabled={isUploading}
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 