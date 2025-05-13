'use client';

import { FiPlus, FiBell, FiUser } from 'react-icons/fi';
import Link from 'next/link';

interface NavbarProps {
  onCreateNew: () => void;
}

export default function Navbar({ onCreateNew }: NavbarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Link href="/courses/faculty" className="text-xl font-semibold text-gray-900">
            Course Dashboard
          </Link>
          <button
            onClick={onCreateNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Create Course
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-blue-600 relative">
            <FiBell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600">
            <FiUser size={20} />
            <span className="text-sm font-medium">John Doe</span>
          </button>
        </div>
      </div>
    </div>
  );
} 