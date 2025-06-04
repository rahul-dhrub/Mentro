'use client';

import React from 'react';
import { OrderSummary as OrderSummaryType } from '../checkout';
import { FiCreditCard } from 'react-icons/fi';

interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnail: string;
  instructor: {
    name: string;
  };
}

interface Cart {
  items: CartItem[];
  totalItems: number;
}

interface OrderSummaryProps {
  cart: Cart;
  orderSummary: OrderSummaryType;
  isProcessing: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function OrderSummary({
  cart,
  orderSummary,
  isProcessing,
  onSubmit,
}: OrderSummaryProps) {
  return (
    <div className="lg:w-96">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
        
        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          {cart.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-12 h-8 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.title}
                </p>
                <p className="text-xs text-gray-600">{item.instructor.name}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${item.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
            <span className="text-gray-900">${orderSummary.subtotal.toFixed(2)}</span>
          </div>
          
          {orderSummary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Course Discounts</span>
              <span className="text-green-600">-${orderSummary.discount.toFixed(2)}</span>
            </div>
          )}

          {orderSummary.couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Coupon Discount</span>
              <span className="text-green-600">-${orderSummary.couponDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                ${orderSummary.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          type="submit"
          onClick={onSubmit}
          disabled={isProcessing}
          className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center cursor-pointer"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <FiCreditCard className="w-5 h-5 mr-2" />
              Complete Order
            </>
          )}
        </button>

        {/* Security Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
              Secure 256-bit SSL encryption
            </div>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
              30-day money-back guarantee
            </div>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
              Instant access after payment
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 