'use client';

import { FiMail, FiPhone, FiMapPin, FiCalendar } from 'react-icons/fi';

interface ContactInfoProps {
  email: string;
  phone: string;
  location: string;
  joinDate: string;
}

export default function ContactInfo({ email, phone, location, joinDate }: ContactInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
        <FiMail className="text-blue-600" size={16} />
        <span className="text-gray-800 text-sm font-medium">{email}</span>
      </div>
      <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
        <FiPhone className="text-green-600" size={16} />
        <span className="text-gray-800 text-sm font-medium">{phone}</span>
      </div>
      <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
        <FiMapPin className="text-red-600" size={16} />
        <span className="text-gray-800 text-sm font-medium">{location}</span>
      </div>
      <div className="flex items-center justify-center lg:justify-start gap-3 bg-gray-50 p-3 rounded-lg">
        <FiCalendar className="text-purple-600" size={16} />
        <span className="text-gray-800 text-sm font-medium">Joined {formatDate(joinDate)}</span>
      </div>
    </div>
  );
} 