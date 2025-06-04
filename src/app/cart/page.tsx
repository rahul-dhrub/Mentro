'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import { FiTrash2, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart } = useCart();

  const handleRemoveItem = (courseId: string) => {
    removeFromCart(courseId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (cart.items.length === 0) {
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
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              </div>
              <Link href="/" className="flex items-center cursor-pointer">
                <span className="text-2xl font-bold text-blue-600">Mentro</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Empty Cart */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <FiShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any courses to your cart yet.</p>
            <Link
              href="/courses"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
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
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <Link href="/" className="flex items-center cursor-pointer">
              <span className="text-2xl font-bold text-blue-600">Mentro</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-800 font-medium cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Course Thumbnail */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center mt-1">
                          <img
                            src={item.instructor.image}
                            alt={item.instructor.name}
                            className="w-5 h-5 rounded-full mr-2"
                          />
                          <span className="text-sm text-gray-600">
                            {item.instructor.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Added on {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        {item.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </p>
                        )}
                        <p className="text-lg font-semibold text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleRemoveItem(item.courseId)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove from cart"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="text-gray-900">
                    ${(cart.items.reduce((sum, item) => 
                      sum + (item.originalPrice || item.price), 0
                    )).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">
                    -${(cart.items.reduce((sum, item) => 
                      sum + (item.originalPrice ? item.originalPrice - item.price : 0), 0
                    )).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${cart.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3 cursor-pointer"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/courses"
                className="block w-full text-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Continue Learning
              </Link>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Lifetime access to all courses
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    30-day money-back guarantee
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Certificate of completion
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 