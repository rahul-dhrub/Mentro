import Link from 'next/link';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';

interface NavbarProps {
  cartCount?: number;
  favoriteCount?: number;
  user?: {
    name: string;
    role: string;
    image: string;
  };
}

export default function Navbar({ cartCount = 0, favoriteCount = 0, user }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Mentro</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <FiShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Favorite Courses */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <FiHeart className="w-6 h-6" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favoriteCount}
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