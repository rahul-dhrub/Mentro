'use client';

import { useState } from 'react';
import { FiX, FiPlus, FiExternalLink, FiLink, FiBook, FiTrash2, FiUpload, FiImage } from 'react-icons/fi';
import { Publication } from '../types';

interface PublicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  publications: Publication[];
  onAddPublication: (publication: Omit<Publication, 'id'>) => Promise<{ success: boolean; publication?: any }>;
  onDeletePublication?: (publicationId: string) => void;
}

const PublicationsModal: React.FC<PublicationsModalProps> = ({
  isOpen,
  onClose,
  publications,
  onAddPublication,
  onDeletePublication
}) => {
  const [newPublicationUrl, setNewPublicationUrl] = useState('');
  const [isAddingPublication, setIsAddingPublication] = useState(false);
  const [newPublication, setNewPublication] = useState<Omit<Publication, 'id'>>({
    title: '',
    url: '',
    journal: '',
    year: new Date().getFullYear(),
    authors: [],
    abstract: '',
    thumbnail: ''
  });
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitPublication = async () => {
    // Validate required fields
    if (!newPublication.title || !newPublication.url) {
      alert('Title and URL are required');
      return;
    }
    
    // Validate field lengths
    if (newPublication.title.length > 200) {
      alert('Title must be 200 characters or less');
      return;
    }
    
    if (newPublication.journal && newPublication.journal.length > 100) {
      alert('Journal/Conference name must be 100 characters or less');
      return;
    }
    
    if (newPublication.abstract && newPublication.abstract.length > 1000) {
      alert('Abstract must be 1000 characters or less');
      return;
    }
    
    // Validate author names (each author should be 100 characters or less)
    if (newPublication.authors && newPublication.authors.some(author => author.length > 100)) {
      alert('Each author name must be 100 characters or less');
      return;
    }
    
    if (isUploadingThumbnail) {
      alert('Please wait for the thumbnail to finish uploading');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      // Call the callback to update the parent component (which handles the API call)
      const result = await onAddPublication(newPublication);
      
      if (result.success) {
        // Reset form
        setNewPublication({
          title: '',
          url: '',
          journal: '',
          year: new Date().getFullYear(),
          authors: [],
          abstract: '',
          thumbnail: ''
        });
        setThumbnailPreview('');
        setIsAddingPublication(false);
        setSubmitSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting publication:', error);
      alert('Failed to save publication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePublication = async (publicationId: string) => {
    if (!confirm('Are you sure you want to delete this publication?')) {
      return;
    }
    
    if (onDeletePublication) {
      onDeletePublication(publicationId);
    }
  };

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select an image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploadingThumbnail(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/publication-thumbnail', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Update the publication with the thumbnail URL
      setNewPublication(prev => ({
        ...prev,
        thumbnail: data.url
      }));
      
      // Set preview for display
      setThumbnailPreview(data.url);
      
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      alert(`Error uploading thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setNewPublication(prev => ({
      ...prev,
      thumbnail: ''
    }));
    setThumbnailPreview('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'authors') {
      // Split by comma and trim each author name
      const authors = value.split(',').map(author => author.trim());
      setNewPublication({
        ...newPublication,
        authors: authors
      });
    } else if (name === 'year') {
      setNewPublication({
        ...newPublication,
        year: parseInt(value) || new Date().getFullYear()
      });
    } else {
      setNewPublication({
        ...newPublication,
        [name]: value
      });
    }
  };

  // Helper function to format URL for display
  const getFormattedUrl = (url: string) => {
    if (!url) return '';
    if (url.match(/^https?:\/\//i)) {
      return url;
    }
    return `https://${url}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FiBook className="mr-2" /> 
            Publications
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-400 rounded-full mr-3"></div>
                <p className="text-sm font-medium text-green-800">
                  Publication saved successfully! You can see it in the list below.
                </p>
              </div>
            </div>
          )}

          {/* Add Publication Section */}
          <div className="mb-6">
            {!isAddingPublication ? (
              <button
                onClick={() => {
                  setIsAddingPublication(true);
                  setSubmitSuccess(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FiPlus className="mr-2" /> 
                {submitSuccess ? 'Add Another Publication' : 'Add Publication'}
              </button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Publication</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={newPublication.title}
                      onChange={handleInputChange}
                      maxLength={200}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white ${
                        newPublication.title && newPublication.title.length > 180
                          ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Publication title"
                      required
                    />
                    {newPublication.title && newPublication.title.length > 150 && (
                      <p className={`text-xs mt-1 ${
                        newPublication.title.length > 180
                          ? 'text-yellow-600'
                          : 'text-gray-500'
                      }`}>
                        {newPublication.title.length}/200 characters
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                    <input
                      type="url"
                      name="url"
                      value={newPublication.url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                      placeholder="example.com/publication or https://example.com/publication"
                      required
                    />
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        You can enter a URL with or without https://
                      </p>
                      {newPublication.url && (
                        <p className="text-xs text-indigo-600 mt-1">
                          Final URL: {getFormattedUrl(newPublication.url)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Journal/Conference</label>
                      <input
                        type="text"
                        name="journal"
                        value={newPublication.journal}
                        onChange={handleInputChange}
                        maxLength={100}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white ${
                          newPublication.journal && newPublication.journal.length > 90
                            ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500'
                            : 'border-gray-300'
                        }`}
                        placeholder="Journal or conference name"
                      />
                      {newPublication.journal && newPublication.journal.length > 80 && (
                        <p className={`text-xs mt-1 ${
                          newPublication.journal.length > 90
                            ? 'text-yellow-600'
                            : 'text-gray-500'
                        }`}>
                          {newPublication.journal.length}/100 characters
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input
                        type="number"
                        name="year"
                        value={newPublication.year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        placeholder="Publication year"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Authors (comma separated)</label>
                    <input
                      type="text"
                      name="authors"
                      value={newPublication.authors?.join(', ')}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                      placeholder="Author 1, Author 2, Author 3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                    <textarea
                      name="abstract"
                      value={newPublication.abstract}
                      onChange={handleInputChange}
                      rows={4}
                      maxLength={1000}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white ${
                        newPublication.abstract && newPublication.abstract.length > 900
                          ? 'border-yellow-400 focus:ring-yellow-500 focus:border-yellow-500'
                          : newPublication.abstract && newPublication.abstract.length === 1000
                          ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Brief summary of the publication"
                    />
                    <div className="mt-1 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Optional: Provide a brief summary of your publication
                      </p>
                      <p className={`text-xs ${
                        newPublication.abstract && newPublication.abstract.length > 900
                          ? newPublication.abstract.length === 1000
                            ? 'text-red-600 font-medium'
                            : 'text-yellow-600'
                          : 'text-gray-500'
                      }`}>
                        {newPublication.abstract ? newPublication.abstract.length : 0}/1000
                      </p>
                    </div>
                  </div>
                  
                  {/* Thumbnail Upload Section */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Thumbnail <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    
                    {!thumbnailPreview ? (
                      <div className="space-y-3">
                        <label 
                          className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                            isUploadingThumbnail 
                              ? 'border-indigo-300 bg-indigo-50 cursor-not-allowed' 
                              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-indigo-400'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploadingThumbnail ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                                <p className="text-sm text-indigo-600 font-medium">Uploading...</p>
                                <p className="text-xs text-gray-500">Please wait</p>
                              </>
                            ) : (
                              <>
                                <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="mb-2 text-sm text-gray-600">
                                  <span className="font-semibold">Click to upload</span> a thumbnail
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, WebP or GIF (Max 5MB)</p>
                              </>
                            )}
                          </div>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                            onChange={handleThumbnailUpload}
                            disabled={isUploadingThumbnail}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="relative flex-shrink-0">
                            <img
                              src={thumbnailPreview}
                              alt="Thumbnail preview"
                              className="w-24 h-24 object-cover rounded-lg border-2 border-white shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveThumbnail}
                              className="absolute -top-2 -right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1.5 transition-colors shadow-sm border border-white cursor-pointer"
                              title="Remove thumbnail"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                              <p className="text-sm font-medium text-green-800">
                                Thumbnail uploaded successfully
                              </p>
                            </div>
                            <p className="text-xs text-green-600 mb-2">
                              Your publication will display this image as a thumbnail
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';
                                input.onchange = (e) => {
                                  const target = e.target as HTMLInputElement;
                                  if (target.files && target.files[0]) {
                                    const syntheticEvent = {
                                      target,
                                      currentTarget: target,
                                    } as React.ChangeEvent<HTMLInputElement>;
                                    handleThumbnailUpload(syntheticEvent);
                                  }
                                };
                                input.click();
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline cursor-pointer"
                            >
                              Replace image
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleSubmitPublication}
                      disabled={isUploadingThumbnail || isSubmitting}
                      className={`px-4 py-2 rounded-md text-white ${
                        isUploadingThumbnail || isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                      }`}
                    >
                      {isUploadingThumbnail ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </div>
                      ) : isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save Publication'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingPublication(false);
                        setThumbnailPreview('');
                        setNewPublication(prev => ({ ...prev, thumbnail: '' }));
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Publications List */}
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your Publications</h3>
            
            {publications.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No publications added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your research publications to showcase your work</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publications.map((publication) => (
                  <div key={publication.id} className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      {publication.thumbnail ? (
                        <div className="w-24 h-24 flex-shrink-0">
                          <img 
                            src={publication.thumbnail} 
                            alt={publication.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FiBook className="text-gray-400" size={32} />
                        </div>
                      )}
                      
                      <div className="p-4 flex-grow">
                        <div className="flex justify-between items-start">
                          <a 
                            href={publication.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-lg font-medium text-indigo-600 hover:text-indigo-700 flex items-center flex-grow cursor-pointer"
                          >
                            {publication.title}
                            <FiExternalLink className="ml-2" size={16} />
                          </a>
                          
                          {onDeletePublication && (
                            <button
                              onClick={() => handleDeletePublication(publication.id)}
                              className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Delete publication"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-600">
                          {publication.journal && (
                            <span>{publication.journal}, </span>
                          )}
                          {publication.year && (
                            <span>{publication.year}</span>
                          )}
                          {publication.citationCount !== undefined && (
                            <span> • {publication.citationCount} citations</span>
                          )}
                        </div>
                        
                        {publication.authors && publication.authors.length > 0 && (
                          <div className="mt-1 text-sm text-gray-500">
                            {publication.authors.join(', ')}
                          </div>
                        )}
                        
                        {publication.abstract && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {publication.abstract}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationsModal; 