'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiUser, FiHash } from 'react-icons/fi';
import { SearchResult } from '../types';

interface SearchBarProps {
  onUserSelect: (userId: string) => void;
  onHashtagSelect: (hashtag: string) => void;
  isSearchActive: boolean;
  setIsSearchActive: (active: boolean) => void;
}

// Helper function to get current user ID from authentication
// This should be replaced with your actual authentication logic
const getCurrentUserId = (): string | null => {
  // Example: return useAuth().user?.id || null;
  // Example: return auth.currentUser?.uid || null;
  // For now, return null since we don't have auth implemented
  return null;
};

export default function SearchBar({ 
  onUserSelect, 
  onHashtagSelect, 
  isSearchActive, 
  setIsSearchActive 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search function using API
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      if (response.ok) {
        const data = await response.json();
        const searchResults: SearchResult[] = data.results.map((result: any) => ({
          type: result.type,
          id: result.id,
          name: result.name,
          avatar: result.avatar,
          title: result.title,
          department: result.department,
          followers: result.followers,
          posts: result.posts,
          description: result.description,
          category: result.category,
          rating: result.rating,
          reviews: result.reviews
        }));
        setResults(searchResults);
      } else {
        console.error('Search API error:', response.statusText);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
    setShowResults(true);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleResultSelect = async (result: SearchResult) => {
    // Record search interaction (only if we have a valid user ID from auth)
    try {
      const currentUserId = getCurrentUserId();
      if (currentUserId) {
        await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUserId,
            query,
            resultType: result.type,
            resultId: result.id,
            resultName: result.name
          })
        });
      }
    } catch (error) {
      console.warn('Failed to record search interaction:', error);
    }

    if (result.type === 'user') {
      onUserSelect(result.id);
    } else {
      onHashtagSelect(result.name);
    }
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    setIsSearchActive(true);
    inputRef.current?.blur();
  };

  // Handle focus and blur
  const handleFocus = () => {
    if (query.trim()) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users, hashtags..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full pl-14 pr-4 px-8 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
        />
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultSelect(result)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              {result.type === 'user' ? (
                <>
                  <div className="flex-shrink-0">
                    <img
                      src={result.avatar}
                      alt={result.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <FiUser className="text-blue-500" size={14} />
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {result.title} • {result.department}
                    </p>
                    <p className="text-xs text-gray-400">
                      {result.followers} followers • {result.posts} posts
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiHash className="text-blue-600" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {result.name}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {result.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {result.posts} posts
                    </p>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-4 z-50">
          <p className="text-center text-gray-500 text-sm">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
} 