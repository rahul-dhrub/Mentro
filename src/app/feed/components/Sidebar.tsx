'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiUsers, FiStar, FiBookOpen, FiAward, FiMail, FiLinkedin, FiTwitter, FiUserPlus, FiBriefcase } from 'react-icons/fi';
import { Author } from '../types';

interface SidebarProps {
  author: Author;
  stats: {
    followers: number;
    following: number;
    rating: number;
    blogs: number;
    publications: number;
  };
  socialLinks?: {
    email?: string;
    linkedin?: string;
    twitter?: string;
  };
  onShowPublications?: () => void;
  onRatingClick?: () => void;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export default function Sidebar({ author, stats, socialLinks, onShowPublications, onRatingClick, onFollowersClick, onFollowingClick }: SidebarProps) {
  const router = useRouter();

  const handleBlogsClick = () => {
    router.push('/blogs');
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-6 w-80">
      {/* Profile Section */}
      <div className="text-center mb-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <Image
            src={author.avatar}
            alt={author.name}
            fill
            className="object-cover rounded-full"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">{author.name}</h2>
        <p className="text-gray-600">{author.title}</p>
        <p className="text-gray-500 text-sm">{author.department}</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div 
          className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onFollowersClick}
        >
          <FiUsers className="mx-auto mb-2 text-blue-500" size={20} />
          <p className="text-lg font-semibold text-gray-900">{stats.followers}</p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
        <div 
          className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onFollowingClick}
        >
          <FiUserPlus className="mx-auto mb-2 text-indigo-500" size={20} />
          <p className="text-lg font-semibold text-gray-900">{stats.following}</p>
          <p className="text-xs text-gray-500">Following</p>
        </div>
        <div 
          className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={onRatingClick}
        >
          <FiStar className="mx-auto mb-2 text-yellow-500" size={20} />
          <p className="text-lg font-semibold text-gray-900">{stats.rating.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Rating</p>
        </div>
        <div 
          className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleBlogsClick}
        >
          <FiBookOpen className="mx-auto mb-2 text-green-500" size={20} />
          <p className="text-lg font-semibold text-gray-900">{stats.blogs}</p>
          <p className="text-xs text-gray-500">Blogs</p>
        </div>
        <div 
          className="bg-gray-50 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-100 transition-colors col-span-2"
          onClick={onShowPublications}
        >
          <FiAward className="mx-auto mb-2 text-purple-500" size={20} />
          <p className="text-lg font-semibold text-gray-900">{stats.publications}</p>
          <p className="text-xs text-gray-500">Publications</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-3 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
        <a
          href="#"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <FiUsers className="mr-2" />
          Student Projects
        </a>
        <a
          href="/jobs"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <FiBriefcase className="mr-2" />
          Jobs
        </a>
      </div>

      {/* Social Links */}
      {socialLinks && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
          <div className="flex justify-center space-x-4">
            {socialLinks.email && (
              <a
                href={`mailto:${socialLinks.email}`}
                className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                title="Email"
              >
                <FiMail size={20} />
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                title="LinkedIn"
              >
                <FiLinkedin size={20} />
              </a>
            )}
            {socialLinks.twitter && (
              <a
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                title="Twitter"
              >
                <FiTwitter size={20} />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 