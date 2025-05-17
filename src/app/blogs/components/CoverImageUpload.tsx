'use client';

import React from 'react';

interface CoverImageUploadProps {
    coverImage: string;
    setCoverImage: (url: string) => void;
    isCoverUploading: boolean;
    handleCoverImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
    coverImage,
    setCoverImage,
    isCoverUploading,
    handleCoverImageUpload
}) => {
    return (
        <div className="mb-4">
            <label htmlFor="coverImage" className="block text-sm font-semibold text-gray-800 mb-1">
                Cover Image
            </label>
            <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        id="coverImage"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="flex-grow px-3 py-2 border border-gray-400 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                        placeholder="Enter image URL or upload an image"
                    />
                    <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md cursor-pointer inline-flex items-center">
                        <span>{isCoverUploading ? 'Uploading...' : 'Upload'}</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden"
                            onChange={handleCoverImageUpload}
                            disabled={isCoverUploading}
                        />
                    </label>
                </div>
                {coverImage && (
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <div className="rounded-md border border-gray-200 overflow-hidden h-32 w-full">
                            <img 
                                src={coverImage} 
                                alt="Cover preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoverImageUpload; 