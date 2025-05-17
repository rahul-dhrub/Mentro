import React from 'react';
import Image from 'next/image';

interface CourseHeaderProps {
  title: string;
  description: string;
  thumbnail: string;
  onEditCourse: () => void;
}

export default function CourseHeader({ 
  title, 
  description, 
  thumbnail, 
  onEditCourse 
}: CourseHeaderProps) {
  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative h-20 w-20 rounded-lg overflow-hidden">
              <Image
                src={thumbnail}
                alt="Course thumbnail"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
          </div>
          <button 
            onClick={onEditCourse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Course
          </button>
        </div>
      </div>
    </div>
  );
} 