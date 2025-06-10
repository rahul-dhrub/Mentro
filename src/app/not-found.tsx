'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IoArrowBack, IoHome, IoSearch } from 'react-icons/io5';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotFound() {
  const { darkMode } = useTheme();

  // Force body styles when component mounts or darkMode changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const body = document.body;
      if (darkMode) {
        body.style.backgroundColor = '#0a0a0a';
        body.style.color = '#ededed';
      } else {
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#171717';
      }
    }
  }, [darkMode]);

  // Force light/dark styles based on current state
  const containerStyle = darkMode ? {
    backgroundColor: '#111827',
    color: '#f9fafb'
  } : {
    backgroundColor: '#f9fafb',
    color: '#111827'
  };

  return (
    <div 
      style={containerStyle}
      className="min-h-screen transition-colors duration-200 flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div 
            style={{
              backgroundColor: darkMode ? '#374151' : '#ffffff',
              borderColor: darkMode ? '#4b5563' : '#e5e7eb'
            }}
            className="inline-flex items-center justify-center w-32 h-32 rounded-full shadow-xl border mb-6"
          >
            <span 
              style={{ color: darkMode ? '#c084fc' : '#4f46e5' }}
              className="text-6xl font-bold"
            >
              404
            </span>
          </div>
          
          {/* Animated search icon */}
          <div className="relative mx-auto w-16 h-16 mb-4">
            <IoSearch 
              style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}
              className="w-16 h-16 animate-pulse" 
            />
            <div 
              style={{
                background: darkMode 
                  ? 'linear-gradient(to right, transparent, #374151, transparent)'
                  : 'linear-gradient(to right, transparent, #f3f4f6, transparent)'
              }}
              className="absolute inset-0 animate-[shimmer_2s_infinite] opacity-60"
            ></div>
          </div>
        </div>

        {/* Error message */}
        <h1 
          style={{ color: darkMode ? '#ffffff' : '#111827' }}
          className="text-3xl font-bold mb-4"
        >
          Page Not Found
        </h1>
        
        <p 
          style={{ color: darkMode ? '#d1d5db' : '#374151' }}
          className="mb-8 leading-relaxed"
        >
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action buttons */}
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <IoHome className="w-5 h-5 mr-2" />
            Go to Homepage
          </Link>
          
          <Link 
            href="javascript:history.back()"
            style={{
              backgroundColor: darkMode ? '#374151' : '#f9fafb',
              borderColor: darkMode ? '#4b5563' : '#d1d5db',
              color: darkMode ? '#d1d5db' : '#374151'
            }}
            className="inline-flex items-center justify-center w-full px-6 py-3 font-medium rounded-lg border transition-colors duration-200 shadow-sm hover:opacity-80"
          >
            <IoArrowBack className="w-5 h-5 mr-2" />
            Go Back
          </Link>
        </div>

        {/* Help text */}
        <p 
          style={{ color: darkMode ? '#9ca3af' : '#6b7280' }}
          className="text-sm mt-8"
        >
          If you believe this is an error, please{' '}
          <Link 
            href="/contact" 
            style={{ color: darkMode ? '#c084fc' : '#4f46e5' }}
            className="hover:underline transition-colors hover:opacity-80"
          >
            contact support
          </Link>
        </p>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          style={{ backgroundColor: darkMode ? '#581c87' : '#e0e7ff' }}
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 animate-pulse"
        ></div>
      </div>
    </div>
  );
} 