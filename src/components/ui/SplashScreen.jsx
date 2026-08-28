import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Completely remove from DOM after 2.5 seconds (allowing 500ms for fade out transition)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative z-10 overflow-hidden mb-8 animate-[fade-in-up_0.8s_ease-out]">
          <img 
            src="/assets/images/logo/msv_logo_500x300.png" 
            alt="Mirror Solar Vision" 
            className="w-auto h-[80px] md:h-[100px] object-contain mix-blend-multiply"
          />
        </div>

        {/* Loading Indicator */}
        <div className="relative z-10 flex gap-2 animate-[fade-in_1s_ease-out_0.5s_both]">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-[bounce_1s_infinite_-0.3s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-[bounce_1s_infinite_-0.15s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#F58220] animate-[bounce_1s_infinite]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
