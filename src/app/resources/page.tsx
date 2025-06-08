'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlay, FiBook, FiVideo, FiExternalLink, FiClock, FiUser, FiArrowLeft } from 'react-icons/fi';

interface Resource {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  embedUrl: string;
  instructor: string;
}

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const resources: Resource[] = [
    {
      id: '1',
      title: 'LaTeX – Full Tutorial for Beginner',
      description: 'Learn LaTeX from scratch with this comprehensive tutorial. Perfect for academic writing, research papers, and mathematical documents.',
      duration: '45 min',
      category: 'academic-writing',
      embedUrl: 'https://www.youtube.com/embed/ydOTMQC7np0?si=Fzvayv1EI3bPBZPV',
      instructor: 'Academic Tutorial'
    },
    {
      id: '2',
      title: 'How to Tutor Online with Zoom (Tools & Techniques)',
      description: 'Master online tutoring with Zoom. Learn essential tools, techniques, and best practices for effective virtual teaching.',
      duration: '32 min',
      category: 'online-teaching',
      embedUrl: 'https://www.youtube.com/embed/Z3GfYFUQAE0?si=HIieWtgkhVPKqRif',
      instructor: 'Teaching Expert'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', count: resources.length },
    { id: 'academic-writing', name: 'Academic Writing', count: resources.filter(r => r.category === 'academic-writing').length },
    { id: 'online-teaching', name: 'Online Teaching', count: resources.filter(r => r.category === 'online-teaching').length }
  ];

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              title="Go Back"
            >
              <FiArrowLeft size={24} />
            </button>
            <FiBook className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Learning Resources</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl">
            Enhance your academic and teaching skills with our curated collection of educational videos and tutorials.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Video Embed */}
              <div className="relative aspect-video">
                <iframe
                  src={resource.embedUrl}
                  title={resource.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              {/* Resource Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                    {resource.title}
                  </h3>
                  <FiPlay className="text-blue-600 flex-shrink-0 ml-2" size={20} />
                </div>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {resource.description}
                </p>

                {/* Resource Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <FiClock className="mr-1" size={14} />
                      {resource.duration}
                    </div>
                    <div className="flex items-center">
                      <FiUser className="mr-1" size={14} />
                      {resource.instructor}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiVideo className="mr-1" size={14} />
                    <span className="capitalize">{resource.category.replace('-', ' ')}</span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    resource.category === 'academic-writing' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {resource.category === 'academic-writing' ? 'Academic Writing' : 'Online Teaching'}
                  </span>
                  
                  <a
                    href={resource.embedUrl.replace('/embed/', '/watch?v=')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    <span className="text-sm mr-1">Watch on YouTube</span>
                    <FiExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <FiVideo className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">Try selecting a different category.</p>
          </div>
        )}

        {/* Additional Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About These Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Academic Writing Tools</h3>
              <p className="text-gray-600 text-sm">
                Learn professional document preparation with LaTeX, the standard for academic publications, 
                research papers, and mathematical documents.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Online Teaching Methods</h3>
              <p className="text-gray-600 text-sm">
                Master the art of virtual instruction with comprehensive guides on online tutoring tools, 
                engagement techniques, and best practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 