import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Fast, smooth fade out after 800ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 800);

    // Completely remove from DOM after 1200ms
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-400 ease-in-out pointer-events-none ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Crisp Logo */}
        <div className="relative z-10 overflow-hidden mb-6">
          <img 
            src="/assets/images/logo/mirror_solar-removebg-preview.png" 
            alt="Mirror Solar Vision" 
            className="w-auto h-[60px] md:h-[80px] object-contain"
          />
        </div>

        {/* Loading Indicator */}
        <div className="relative z-10 flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#F58220] animate-bounce [animation-delay:-0.3s]"></div>
        </div>
      </div>
    </div>
  );
}
