import React from 'react';

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar placeholder */}
      <div className="h-16 bg-white shadow animate-pulse"></div>
      
      {/* Course header placeholder */}
      <div className="w-full h-64 bg-gray-200 animate-pulse"></div>
      
      {/* Content placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content placeholders */}
          <div className="flex-1">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-6 animate-pulse"></div>
            
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Sidebar placeholder */}
          <div className="md:w-80">
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 