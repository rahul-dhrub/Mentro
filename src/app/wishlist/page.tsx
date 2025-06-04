'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { FiArrowLeft, FiHeart, FiShoppingCart, FiTrash2, FiStar, FiUsers, FiClock, FiCheck } from 'react-icons/fi';
import Link from 'next/link';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (item: any) => {
    // Convert wishlist item to cart item format
    const cartItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      originalPrice: item.originalPrice,
      thumbnail: item.thumbnail,
      instructor: {
        name: item.instructor.name,
        image: item.instructor.avatar,
        rating: 0, // Default values
        reviews: 0,
      },
      rating: item.rating,
      reviews: 0,
      students: item.studentsCount,
      category: item.category,
      level: item.level as 'Beginner' | 'Intermediate' | 'Advanced',
      duration: item.duration,
      lastUpdated: new Date(),
      features: [],
      requirements: [],
      whatYouWillLearn: [],
      curriculum: [],
    };
    
    addToCart(cartItem);
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    removeFromWishlist(itemId);
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      clearWishlist();
    }
  };

  if (wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group cursor-pointer"
                >
                  <FiArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                  <span className="font-medium">Back</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              </div>
              <Link href="/" className="flex items-center cursor-pointer">
                <span className="text-2xl font-bold text-blue-600">Mentro</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <FiHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start adding courses you're interested in to your wishlist. You can save courses for later and never lose track of what you want to learn.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group cursor-pointer"
              >
                <FiArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {wishlist.totalItems} item{wishlist.totalItems !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-500">
                  (max 50)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {wishlist.totalItems >= 45 && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                  {50 - wishlist.totalItems} slots left
                </span>
              )}
              <button
                onClick={handleClearWishlist}
                className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer"
              >
                Clear All
              </button>
              <Link href="/" className="flex items-center cursor-pointer">
                <span className="text-2xl font-bold text-blue-600">Mentro</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.items.map((item) => {
            const isInCartStatus = isInCart(item.id);
            
            return (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                <Link href={`/courses/${item.id}`} className="block cursor-pointer">
                  {/* Course Thumbnail */}
                  <div className="aspect-video relative">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium">
                        View Course
                      </span>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <span className="mr-4">{item.instructor.name}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
                      <div className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{item.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="w-4 h-4 mr-1" />
                        <span>{item.studentsCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm">
                        {item.originalPrice && item.originalPrice !== item.price ? (
                          <div className="flex items-center">
                            <span className="text-gray-900 font-bold">${item.price}</span>
                            <span className="text-gray-600 line-through ml-2">${item.originalPrice}</span>
                          </div>
                        ) : (
                          <span className="text-gray-900 font-bold">${item.price}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Action Buttons */}
                <div className="p-4 pt-0 space-y-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={isInCartStatus}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isInCartStatus
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isInCartStatus ? (
                      <>
                        <FiCheck className="w-4 h-4" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <FiShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="w-full py-2 px-4 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Continue Browsing Courses
          </Link>
        </div>
      </div>
    </div>
  );
} 