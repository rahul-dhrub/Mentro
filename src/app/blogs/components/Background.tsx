'use client';

import React, { useEffect, useState } from 'react';
import Lottie from "lottie-react";

interface BackgroundProps {
    children: React.ReactNode;
}

const Background: React.FC<BackgroundProps> = ({ children }) => {
    const [animationData, setAnimationData] = useState<any>(null);

    useEffect(() => {
        // Fetch animation data from public folder
        fetch('/animation.json')
            .then(response => response.json())
            .then(data => setAnimationData(data))
            .catch(error => console.error('Error loading animation:', error));
    }, []);

    return (
        <>
            <div className="fixed inset-0 -z-10">
                {animationData && (
                    <Lottie
                        animationData={animationData}
                        loop
                        autoplay
                        style={{ height: "100vh", width: "100vw", backgroundColor: "white" }}
                    />
                )}
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 bg-white/90 p-4 rounded-lg shadow-sm">Blogs</h1>
                {children}
            </div>
        </>
    );
};

export default Background; 