import React from 'react';
import Image from 'next/image';
import { getInitials, getColorFromName } from '@/lib/utils/userUtils';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

const sizeClasses = {
  small: 'h-8 w-8 text-xs',
  medium: 'h-12 w-12 text-sm',
  large: 'h-16 w-16 text-base',
  xlarge: 'h-24 w-24 text-lg'
};

export const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  imageUrl, 
  size = 'medium', 
  className = '' 
}) => {
  const initials = getInitials(name);
  const colorClass = getColorFromName(name);
  const sizeClass = sizeClasses[size];
  
  if (imageUrl) {
    return (
      <div className={`relative ${sizeClass} rounded-full overflow-hidden ${className}`}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
    );
  }
  
  // Fallback to initials
  return (
    <div className={`${sizeClass} rounded-full ${colorClass} flex items-center justify-center text-white font-semibold ${className}`}>
      {initials}
    </div>
  );
};

export default Avatar; 