'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Wishlist, WishlistItem, WishlistContextType } from '../app/wishlist/wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

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
  const [wishlist, setWishlist] = useState<Wishlist>({
    items: [],
    totalItems: 0,
  });

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mentro_wishlist');
    if (saved) {
      try {
        const parsedWishlist = JSON.parse(saved);
        setWishlist(parsedWishlist);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('mentro_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (item: Omit<WishlistItem, 'addedAt'>) => {
    setWishlist(prev => {
      // Check if item already exists
      if (prev.items.find(wishlistItem => wishlistItem.id === item.id)) {
        return prev;
      }

      const newItem: WishlistItem = {
        ...item,
        addedAt: new Date(),
      };

      const newItems = [...prev.items, newItem];
      return {
        items: newItems,
        totalItems: newItems.length,
      };
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlist(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      return {
        items: newItems,
        totalItems: newItems.length,
      };
    });
  };

  const clearWishlist = () => {
    setWishlist({
      items: [],
      totalItems: 0,
    });
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
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
} 