'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Wishlist, WishlistItem, WishlistContextType } from '../app/wishlist/wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Constants
const MAX_WISHLIST_ITEMS = 50;

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { isSignedIn, userId } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist>({
    items: [],
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch wishlist from database when user is authenticated
  useEffect(() => {
    if (isSignedIn && userId) {
      fetchWishlist();
    } else {
      // Clear wishlist if user is not signed in
      setWishlist({
        items: [],
        totalItems: 0,
      });
    }
  }, [isSignedIn, userId]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/wishlist');
      if (response.ok) {
        const wishlistData = await response.json();
        setWishlist({
          items: wishlistData.items || [],
          totalItems: wishlistData.totalItems || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (item: Omit<WishlistItem, 'addedAt'>) => {
    if (!isSignedIn) {
      alert('Please sign in to add items to wishlist');
      return;
    }

    // Check if item already exists
    if (wishlist.items.find(wishlistItem => wishlistItem.id === item.id)) {
      alert('This course is already in your wishlist');
      return;
    }

    // Check maximum wishlist items limit
    if (wishlist.items.length >= MAX_WISHLIST_ITEMS) {
      alert(`You can only have a maximum of ${MAX_WISHLIST_ITEMS} items in your wishlist. Please remove some items to add new ones.`);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        const result = await response.json();
        setWishlist({
          items: result.items || [],
          totalItems: result.totalItems || 0,
        });
      } else {
        const error = await response.json();
        if (error.error === 'Wishlist limit exceeded') {
          alert(`You can only have a maximum of ${MAX_WISHLIST_ITEMS} items in your wishlist.`);
        } else {
          console.error('Error adding to wishlist:', error.error);
          alert(error.error || 'Failed to add item to wishlist');
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add item to wishlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!isSignedIn) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        setWishlist({
          items: result.items || [],
          totalItems: result.totalItems || 0,
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!isSignedIn) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/wishlist', {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlist({
          items: [],
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (itemId: string) => {
    return wishlist.items.some(item => item.id === itemId);
  };

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    isLoading,
    maxItems: MAX_WISHLIST_ITEMS,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
} 