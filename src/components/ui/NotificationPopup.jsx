import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

export default function NotificationPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    // Check if the user has already closed it in this session, optional.
    // For now, it shows every time they visit as requested.
    const timerId = setTimeout(() => {
      setIsRendered(true);
      // Small delay for the animation to trigger after rendering
      setTimeout(() => setIsVisible(true), 50);
    }, 1000); // Show 1 second after load

    return () => clearTimeout(timerId);
  }, []);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed top-24 right-4 sm:right-8 z-[400] w-[320px] bg-white rounded-2xl shadow-2xl border border-primary-100 p-4 transition-all duration-500 ease-out transform ${
        isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col pr-4">
        <h3 className="text-[14px] font-bold text-gray-900 mb-1">
          Partner with Us!
        </h3>
        <p className="text-[12px] text-gray-600 mb-3 leading-relaxed">
          Calling all new dealers and technicians! Register to partner with Mirror Solar today.
        </p>

        <a 
          href="#partner-registration" 
          onClick={() => {
            // Optional: close popup on click
            setIsVisible(false);
          }}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white text-[12px] font-bold py-2 px-4 rounded-xl shadow-sm transition-all duration-300 w-fit"
        >
          Register Here
          <ExternalLink size={12} className="opacity-80" />
        </a>
      </div>
    </div>
  );
}
