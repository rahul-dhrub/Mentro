'use client';

import React, { useState } from 'react';
import { FiMessageCircle, FiX, FiMail, FiPhone, FiSend } from 'react-icons/fi';
import ContactModal from './ContactModal';

export default function FloatingContactButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Contact Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-[9999] group"
        aria-label="Contact us"
        style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}
      >
        <FiMessageCircle className="w-6 h-6" />
        
        {/* Tooltip */}
        <div className="fixed bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Contact Us
          <div className="fixed top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 