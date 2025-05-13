'use client';

import Image from 'next/image';
import { FiAward, FiBook, FiDollarSign } from 'react-icons/fi';

export default function ForTutorsSection() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">For Tutors</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiAward className="text-blue-600" size={20} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Build Your Brand</h3>
                  <p className="text-gray-600">
                    Create your professional profile and showcase your expertise to potential
                    students.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiBook className="text-purple-600" size={20} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Design Your Curriculum</h3>
                  <p className="text-gray-600">
                    Create and structure your courses with our intuitive curriculum builder.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-green-600" size={20} />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Earn Revenue</h3>
                  <p className="text-gray-600">
                    Set your own prices and earn through course sales, live sessions, and more.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60"
              alt="Tutors teaching"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 