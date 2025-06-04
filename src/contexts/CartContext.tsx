'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CartItem, Cart, CartContextType } from '../app/cart/cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

// Constants
const MAX_CART_ITEMS = 25;

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { isSignedIn, userId } = useAuth();
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from database when user is authenticated
  useEffect(() => {
    if (isSignedIn && userId) {
      fetchCart();
    } else {
      // Clear cart if user is not signed in
      setCart({
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }
  }, [isSignedIn, userId]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      if (response.ok) {
        const cartData = await response.json();
        setCart({
          items: cartData.items || [],
          totalItems: cartData.totalItems || 0,
          totalAmount: cartData.totalAmount || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (course: any) => {
    if (!isSignedIn) {
      alert('Please sign in to add items to cart');
      return;
    }

    // Check if course is already in cart
    if (cart.items.some(item => item.courseId === course.id)) {
      alert('This course is already in your cart');
      return;
    }

    // Check maximum cart items limit
    if (cart.items.length >= MAX_CART_ITEMS) {
      alert(`You can only have a maximum of ${MAX_CART_ITEMS} items in your cart. Please remove some items to add new ones.`);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      });

      if (response.ok) {
        const result = await response.json();
        setCart({
          items: result.items || [],
          totalItems: result.totalItems || 0,
          totalAmount: result.totalAmount || 0,
        });
      } else {
        const error = await response.json();
        if (error.error === 'Cart limit exceeded') {
          alert(`You can only have a maximum of ${MAX_CART_ITEMS} items in your cart.`);
        } else {
          console.error('Error adding to cart:', error.error);
          alert(error.error || 'Failed to add item to cart');
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (courseId: string) => {
    if (!isSignedIn) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart/${courseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        setCart({
          items: result.items || [],
          totalItems: result.totalItems || 0,
          totalAmount: result.totalAmount || 0,
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isSignedIn) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        setCart({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isInCart = (courseId: string): boolean => {
    return cart.items.some(item => item.courseId === courseId);
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    isLoading,
    maxItems: MAX_CART_ITEMS,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 