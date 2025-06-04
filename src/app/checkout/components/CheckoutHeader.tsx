'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

interface CheckoutHeaderProps {
  title?: string;
  backButtonText?: string;
}

export default function CheckoutHeader({ 
  title = "Checkout", 
  backButtonText = "Back to Cart" 
}: CheckoutHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group cursor-pointer"
            >
              <FiArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
              <span className="font-medium">{backButtonText}</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          <Link href="/" className="flex items-center cursor-pointer">
            <span className="text-2xl font-bold text-blue-600">Mentro</span>
          </Link>
        </div>
      </div>
    </div>
  );
} 