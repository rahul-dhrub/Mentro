'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Cart, CartContextType } from '../app/cart/cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

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
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0,
  });

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('mentro_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('mentro_cart', JSON.stringify(cart));
  }, [cart]);

  // Calculate totals whenever items change
  useEffect(() => {
    const totalItems = cart.items.length;
    const totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);
    
    setCart(prevCart => ({
      ...prevCart,
      totalItems,
      totalAmount,
    }));
  }, [cart.items]);

  const addToCart = (course: any) => {
    // Check if course is already in cart
    if (cart.items.some(item => item.courseId === course.id)) {
      return; // Course already in cart
    }

    const cartItem: CartItem = {
      id: `cart_${course.id}_${Date.now()}`,
      courseId: course.id,
      title: course.title,
      instructor: {
        name: course.instructor.name,
        image: course.instructor.image,
      },
      price: course.price,
      originalPrice: course.originalPrice,
      thumbnail: course.thumbnail,
      addedAt: new Date(),
    };

    setCart(prevCart => ({
      ...prevCart,
      items: [...prevCart.items, cartItem],
    }));
  };

  const removeFromCart = (courseId: string) => {
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.filter(item => item.courseId !== courseId),
    }));
  };

  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalAmount: 0,
    });
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
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 