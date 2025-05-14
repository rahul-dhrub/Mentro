'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiChevronDown, FiDownload, FiFileText, FiVideo, FiBookmark, FiHelpCircle } from 'react-icons/fi';
import { useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export default function Navbar() {
  const [showResources, setShowResources] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const downloadsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resourcesRef.current && !resourcesRef.current.contains(event.target as Node)) {
        setShowResources(false);
      }
      if (downloadsRef.current && !downloadsRef.current.contains(event.target as Node)) {
        setShowDownloads(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 relative">
                <Image
                  src="https://i.pinimg.com/736x/64/f1/1f/64f11f54d79943474b3c41f35cf090fe.jpg"
                  alt="Mentro Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="ml-2">
              <span className="text-xl font-bold text-blue-600">Mentro</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/feed" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>

            {/* Resources Dropdown */}
            <div className="relative" ref={resourcesRef}>
              <button
                onClick={() => setShowResources(!showResources)}
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                Resources
                <FiChevronDown className="ml-1" />
              </button>
              {showResources && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-4 grid grid-cols-2 gap-4">
                  <Link href="/resources/guides" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiFileText className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Learning Guides</div>
                      <div className="text-sm text-gray-500">Comprehensive study materials</div>
                    </div>
                  </Link>
                  <Link href="/resources/videos" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiVideo className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Video Tutorials</div>
                      <div className="text-sm text-gray-500">Step-by-step video guides</div>
                    </div>
                  </Link>
                  <Link href="/resources/faq" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiHelpCircle className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">FAQ</div>
                      <div className="text-sm text-gray-500">Common questions answered</div>
                    </div>
                  </Link>
                  <Link href="/resources/blog" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiBookmark className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Blog</div>
                      <div className="text-sm text-gray-500">Latest updates and tips</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Downloads Dropdown */}
            <div className="relative" ref={downloadsRef}>
              <button
                onClick={() => setShowDownloads(!showDownloads)}
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                Downloads
                <FiChevronDown className="ml-1" />
              </button>
              {showDownloads && (
                <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-4 grid grid-cols-2 gap-4">
                  <Link href="/downloads/app" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiDownload className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Mobile App</div>
                      <div className="text-sm text-gray-500">Learn on the go</div>
                    </div>
                  </Link>
                  <Link href="/downloads/desktop" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiDownload className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Desktop App</div>
                      <div className="text-sm text-gray-500">Enhanced learning experience</div>
                    </div>
                  </Link>
                  <Link href="/downloads/offline" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiDownload className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Offline Content</div>
                      <div className="text-sm text-gray-500">Download for offline use</div>
                    </div>
                  </Link>
                  <Link href="/downloads/tools" className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                    <FiDownload className="text-blue-600 mr-2" />
                    <div>
                      <div className="font-medium text-gray-900">Learning Tools</div>
                      <div className="text-sm text-gray-500">Additional resources</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <button
                type="button"
                onClick={() => router.push("/sign-in")}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => router.push("/sign-up")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign up
              </button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav >
  );
} 