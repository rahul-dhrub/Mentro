'use client';

import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex justify-center py-20 bg-white/80 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
};

export default LoadingSpinner; 