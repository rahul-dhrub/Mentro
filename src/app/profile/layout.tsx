'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiUsers } from 'react-icons/fi';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/profile' && pathname === '/profile') return true;
    if (path !== '/profile' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
} 