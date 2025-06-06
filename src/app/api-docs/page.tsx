'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

// Import swagger styles
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/swagger');
        if (!response.ok) {
          throw new Error('Failed to fetch API specification');
        }
        const swaggerSpec = await response.json();
        setSpec(swaggerSpec);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API docs');
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <h3 className="font-bold">Error Loading API Documentation</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Mentro API Documentation</h1>
          <p className="text-blue-100 text-lg">
            Interactive API documentation for the Mentro learning platform
          </p>
          <div className="mt-4 flex space-x-4">
            <span className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full text-sm">
              OpenAPI 3.0
            </span>
            <span className="bg-purple-500 bg-opacity-50 px-3 py-1 rounded-full text-sm">
              REST API
            </span>
            <span className="bg-green-500 bg-opacity-50 px-3 py-1 rounded-full text-sm">
              Interactive
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-100 border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-6">
            <a 
              href="#overview" 
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Overview
            </a>
            <a 
              href="#authentication" 
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Authentication
            </a>
            <a 
              href="#endpoints" 
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              Endpoints
            </a>
            <a 
              href="/feed" 
              className="text-gray-600 hover:text-blue-600 font-medium"
            >
              ← Back to App
            </a>
          </nav>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">🚀 Quick Start</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-700 mb-2">Base URL</h3>
              <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}
              </code>
            </div>
            <div>
              <h3 className="font-medium text-blue-700 mb-2">Authentication</h3>
              <p className="text-blue-600 text-sm">
                Uses Clerk JWT tokens in Authorization header
              </p>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">📝 Posts & Comments</h3>
            <p className="text-gray-600 text-sm">
              Create, read, update posts with threaded comments and media support
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">👥 User Management</h3>
            <p className="text-gray-600 text-sm">
              User profiles, authentication, and social features
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-800 mb-2">📚 Assignments</h3>
            <p className="text-gray-600 text-sm">
              Assignment management, submissions, and grading system
            </p>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="container mx-auto px-4 pb-8">
        {spec && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <SwaggerUI 
              spec={spec}
              docExpansion="list"
              defaultModelsExpandDepth={2}
              tryItOutEnabled={true}
              requestInterceptor={(request) => {
                // Add any default headers or transformations here
                return request;
              }}
              responseInterceptor={(response) => {
                // Handle responses if needed
                return response;
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Mentro API Documentation - Built with Swagger UI
          </p>
          <p className="text-gray-500 text-sm mt-2">
            For support, contact the development team
          </p>
        </div>
      </footer>
    </div>
  );
} 