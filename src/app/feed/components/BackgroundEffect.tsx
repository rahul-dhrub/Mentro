'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    VANTA: {
      TRUNK: (config: any) => any;
    };
  }
}

export default function BackgroundEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || !window.VANTA) return;

    // Initialize Vanta effect
    effectRef.current = window.VANTA.TRUNK({
      el: containerRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x961b3e,
      backgroundColor: 0xefefef,
      spacing: 1.00
    });

    // Cleanup
    return () => {
      if (effectRef.current) {
        effectRef.current.destroy();
      }
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div 
        className="fixed inset-0 -z-10"
        style={{ background: '#efefef' }}
      />
    );
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js"
        strategy="afterInteractive"
      />
      <Script 
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.trunk.min.js"
        strategy="afterInteractive"
      />
      <div
        ref={containerRef}
        className="fixed inset-0 -z-10"
        style={{ background: '#efefef' }}
      />
    </>
  );
} 