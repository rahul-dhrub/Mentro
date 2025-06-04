'use client';

import React from 'react';
import { Coupon } from '../checkout';
import { FiPercent, FiCheck, FiX } from 'react-icons/fi';

interface CouponCodeProps {
  couponCode: string;
  appliedCoupon: Coupon | null;
  couponLoading: boolean;
  onCouponCodeChange: (code: string) => void;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

export default function CouponCode({
  couponCode,
  appliedCoupon,
  couponLoading,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon,
}: CouponCodeProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onApplyCoupon();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <FiPercent className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Promo Code</h2>
      </div>

      {!appliedCoupon || !appliedCoupon.isValid ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => onCouponCodeChange(e.target.value)}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 bg-white border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={couponLoading || !couponCode.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {couponLoading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <FiCheck className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="font-medium text-green-900">{appliedCoupon.code}</p>
              <p className="text-sm text-green-700">{appliedCoupon.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-green-600 hover:text-green-800 cursor-pointer"
            title="Remove coupon"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {appliedCoupon && !appliedCoupon.isValid && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{appliedCoupon.message}</p>
        </div>
      )}

      {/* Demo Coupons */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700 font-medium mb-2">Demo Coupons:</p>
        <div className="space-y-1 text-xs text-blue-600">
          <p><code>SAVE10</code> - 10% off</p>
          <p><code>WELCOME20</code> - $20 off</p>
          <p><code>STUDENT15</code> - 15% off</p>
        </div>
      </div>
    </div>
  );
} 