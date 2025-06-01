'use client';

import { useState } from 'react';
import { FiX, FiPlus, FiExternalLink, FiLink, FiBook } from 'react-icons/fi';
import { Publication } from '../types';

interface PublicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  publications: Publication[];
  onAddPublication: (publication: Omit<Publication, 'id'>) => void;
}

const PublicationsModal: React.FC<PublicationsModalProps> = ({
  isOpen,
  onClose,
  publications,
  onAddPublication
}) => {
  const [newPublicationUrl, setNewPublicationUrl] = useState('');
  const [isAddingPublication, setIsAddingPublication] = useState(false);
  const [newPublication, setNewPublication] = useState<Omit<Publication, 'id'>>({
    title: '',
    url: '',
    journal: '',
    year: new Date().getFullYear(),
    authors: [],
    abstract: ''
  });

  const handleSubmitPublication = () => {
    if (!newPublication.title || !newPublication.url) {
      alert('Title and URL are required');
      return;
    }
    
    onAddPublication(newPublication);
    
    // Reset form
    setNewPublication({
      title: '',
      url: '',
      journal: '',
      year: new Date().getFullYear(),
      authors: [],
      abstract: ''
    });
    setIsAddingPublication(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'authors') {
      // Split by comma and trim each author name
      setNewPublication({
        ...newPublication,
        authors: value.split(',').map(author => author.trim())
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
          {/* Add Publication Section */}
          <div className="mb-6">
            {!isAddingPublication ? (
              <button
                onClick={() => setIsAddingPublication(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
              >
                <FiPlus className="mr-2" /> Add Publication
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                      placeholder="Publication title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
                    <input
                      type="url"
                      name="url"
                      value={newPublication.url}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                      placeholder="https://example.com/publication"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Journal/Conference</label>
                      <input
                        type="text"
                        name="journal"
                        value={newPublication.journal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                        placeholder="Journal or conference name"
                      />
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
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                      placeholder="Brief summary of the publication"
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleSubmitPublication}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
                    >
                      Save Publication
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsAddingPublication(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
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
                        <a 
                          href={publication.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-medium text-indigo-600 hover:text-indigo-700 flex items-center"
                        >
                          {publication.title}
                          <FiExternalLink className="ml-2" size={16} />
                        </a>
                        
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