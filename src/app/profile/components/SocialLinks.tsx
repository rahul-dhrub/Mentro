'use client';

import { FiGithub, FiLinkedin, FiGlobe } from 'react-icons/fi';

interface SocialLinksProps {
  social: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

export default function SocialLinks({ social }: SocialLinksProps) {
  const hasAnySocialLinks = social.github || social.linkedin || social.website;

  if (!hasAnySocialLinks) {
    return null;
  }

  return (
    <div className="flex justify-center lg:justify-start gap-4 mb-6">
      {social.github && (
        <a
          href={social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-white transition-colors shadow-md"
        >
          <FiGithub size={16} />
          <span className="text-sm font-medium">GitHub</span>
        </a>
      )}
      {social.linkedin && (
        <a
          href={social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors shadow-md"
        >
          <FiLinkedin size={16} />
          <span className="text-sm font-medium">LinkedIn</span>
        </a>
      )}
      {social.website && (
        <a
          href={social.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors shadow-md"
        >
          <FiGlobe size={16} />
          <span className="text-sm font-medium">Website</span>
        </a>
      )}
    </div>
  );
} 