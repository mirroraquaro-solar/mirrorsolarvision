import React, { useState, useEffect } from 'react';
import { Phone, Zap, Menu, X } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[300] h-[75px] bg-white/90 backdrop-blur-[12px] border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'shadow-md bg-white/95 h-[65px]' : ''}`}>
        <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto px-4 sm:px-8">
          
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 shrink-0 py-1 overflow-hidden">
            <img 
              src="/assets/images/logo/msv_logo_500x300.png" 
              alt="Mirror Solar Vision Logo" 
              className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-[44px]' : 'h-[52px]'}`}
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6">
            <a href="#home" className="text-[14px] font-bold text-gray-900 hover:text-primary-500 transition-colors">Home</a>
            <a href="#about" className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors">About Us</a>
            <a href="#why-choose-us" className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors">Why Choose Us</a>
            <a href="#drain-clips" className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors">Drain Clips</a>
            <a href="#subsidy-guide" className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors">Subsidy Guide</a>
            <a href="#projects" className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors">Projects</a>
            <a href="#testimonials" className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors">Testimonials</a>
            <a href="#contact" className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors">Contact</a>
          </nav>

          {/* Contact Details & CTA */}
          <div className="hidden xl:flex items-center gap-6">
            <a href="tel:+919347416140" className="flex items-center gap-1.5 text-[14px] font-bold text-gray-950 hover:text-primary-500 transition-colors">
              <Phone size={16} className="text-green-500 fill-green-500/20" />
              <span>+91 93474 16140</span>
            </a>
            <a href="#contact" className="flex items-center gap-1.5 bg-gradient-to-r from-accent-500 to-[#F58220] hover:from-[#F58220] hover:to-accent-500 text-white px-5 py-2.5 rounded-full font-bold text-[13px] shadow-accent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
              <Zap size={12} className="fill-white" />
              Get Free Quote
            </a>
          </div>

          {/* Mobile Actions Container */}
          <div className="xl:hidden flex items-center gap-3">
            <a 
              href="tel:+919347416140" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
              aria-label="Call Us"
            >
              <Phone size={18} className="text-green-500 fill-green-500/20" />
            </a>
            
            {/* Mobile Menu Button */}
            <button 
              className="flex items-center justify-center w-10 h-10 text-gray-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[200] transition-opacity duration-300 xl:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <nav 
        className={`fixed top-[80px] bottom-0 left-0 w-[280px] bg-white z-[250] shadow-2xl transition-transform duration-300 ease-in-out xl:hidden flex flex-col p-6 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col gap-4">
          <a href="#home" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-bold text-primary-500 border-b border-gray-100">Home</a>
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">About Us</a>
          <a href="#why-choose-us" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">Why Choose Us</a>
          <a href="#drain-clips" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">Drain Clips</a>
          <a href="#subsidy-guide" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">Subsidy Guide</a>
          <a href="#projects" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">Projects</a>
          <a href="#testimonials" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">Testimonials</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500 border-b border-gray-100 pb-4">Contact</a>
          
          <a href="tel:+919347416140" className="flex items-center gap-2 py-3 text-sm font-bold text-gray-900 mt-4">
            <Phone size={18} className="text-green-500 fill-green-500/20" />
            +91 93474 16140
          </a>
          
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] text-white py-3 px-4 rounded-xl font-bold shadow-accent mt-2">
            <Zap size={16} className="fill-white" />
            Get Free Quote
          </a>
        </div>
      </nav>
    </>
  );
}
