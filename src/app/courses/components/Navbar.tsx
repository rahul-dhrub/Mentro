'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiHeart, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishlistContext';

interface NavbarProps {
  user?: {
    name: string;
    role: string;
    image: string;
  };
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonText?: string;
}

export default function Navbar({ 
  user, 
  showBackButton = false,
  onBackClick,
  backButtonText = "Back"
}: NavbarProps) {
  const router = useRouter();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const handleCartClick = () => {
    router.push('/cart');
  };

  const handleWishlistClick = () => {
    router.push('/wishlist');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Logo and Back Button */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && onBackClick && (
              <button
                onClick={onBackClick}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <FiArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                <span className="font-medium hidden sm:inline">{backButtonText}</span>
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Mentro</span>
            </Link>
          </div>

          {/* Right Side - Navigation Items */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <button 
              onClick={handleCartClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="View Cart"
            >
              <FiShoppingCart className="w-6 h-6" />
              {cart.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button 
              onClick={handleWishlistClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="View Wishlist"
            >
              <FiHeart className="w-6 h-6" />
              {wishlist.totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.totalItems}
                </span>
              )}
            </button>

            {/* Profile */}
            {user && (
              <div className="flex items-center space-x-3">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 