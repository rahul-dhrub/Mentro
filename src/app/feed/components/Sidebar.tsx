'use client';

import Image from 'next/image';
import { FiUsers, FiStar, FiBookOpen, FiAward, FiMail, FiLinkedin, FiTwitter } from 'react-icons/fi';
import { Author } from '../types';

interface SidebarProps {
  author: Author;
  stats: {
    followers: number;
    rating: number;
    blogs: number;
    publications: number;
  };
  socialLinks?: {
    email?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export default function Sidebar({ author, stats, socialLinks }: SidebarProps) {
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
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <FiUsers className="mx-auto mb-2 text-blue-500" size={24} />
          <p className="text-2xl font-semibold text-gray-900">{stats.followers}</p>
          <p className="text-sm text-gray-500">Followers</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <FiStar className="mx-auto mb-2 text-yellow-500" size={24} />
          <p className="text-2xl font-semibold text-gray-900">{stats.rating}</p>
          <p className="text-sm text-gray-500">Rating</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <FiBookOpen className="mx-auto mb-2 text-green-500" size={24} />
          <p className="text-2xl font-semibold text-gray-900">{stats.blogs}</p>
          <p className="text-sm text-gray-500">Blogs</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <FiAward className="mx-auto mb-2 text-purple-500" size={24} />
          <p className="text-2xl font-semibold text-gray-900">{stats.publications}</p>
          <p className="text-sm text-gray-500">Publications</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-3 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Quick Links</h3>
        <a
          href="#"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FiBookOpen className="mr-2" />
          View All Blogs
        </a>
        <a
          href="#"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FiAward className="mr-2" />
          Research Publications
        </a>
        <a
          href="#"
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FiUsers className="mr-2" />
          Student Projects
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
                className="text-gray-400 hover:text-blue-600 transition-colors"
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
                className="text-gray-400 hover:text-blue-600 transition-colors"
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
                className="text-gray-400 hover:text-blue-600 transition-colors"
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