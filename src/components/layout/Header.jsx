import React, { useState, useEffect } from 'react';
import { Phone, Zap, Menu, X, Package, User, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_CONTACT } from '../../data/bulkComboData';

export default function Header({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isAuthenticated, userProfile, openAuthModal, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (target) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.hash = target;
    }
  };

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate('home');
    }
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[300] bg-white/95 backdrop-blur-[12px] border-b border-slate-200/80 transition-all duration-300 ${
          isScrolled ? 'shadow-md h-[78px]' : 'h-[96px]'
        }`}
      >
        <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto px-4 sm:px-8">
          
          {/* Logo with 2x size and zero padding constraint */}
          <a 
            href="#home" 
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }} 
            className="flex items-center shrink-0 p-0 transition-transform hover:scale-105"
            aria-label="Mirror Solar Vision Home"
          >
            <img 
              src="/assets/images/logo/mirror_solar-removebg-preview.png" 
              alt="Mirror Solar Vision Logo" 
              className={`w-auto object-contain transition-all duration-300 origin-left scale-110 sm:scale-125 ${
                isScrolled ? 'h-[64px] sm:h-[72px]' : 'h-[80px] sm:h-[94px]'
              }`}
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-7">
            <a 
              href="#home" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
              className="text-[14px] font-bold text-slate-800 hover:text-primary-600 transition-colors"
            >
              Home
            </a>

            {/* Mirror Solar Store Pill Nav Link as shown in Image 3 */}
            <a 
              href="#store" 
              onClick={(e) => { e.preventDefault(); handleNavClick('store'); }} 
              className="inline-flex items-center gap-2 text-[14px] font-bold text-white bg-[#0A2540] hover:bg-[#071A2E] px-5 py-2 rounded-full shadow-sm transition-all duration-200 transform hover:scale-105"
            >
              <span className="w-4 h-4 rounded bg-accent-500 flex items-center justify-center text-slate-950 text-[10px]">📦</span>
              <span>Mirror Solar Store</span>
            </a>

            <button 
              onClick={() => scrollToSection('projects')}
              className="text-[14px] font-semibold text-slate-700 hover:text-primary-600 transition-colors cursor-pointer"
            >
              Projects
            </button>

            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-[14px] font-semibold text-slate-700 hover:text-primary-600 transition-colors cursor-pointer"
            >
              Testimonials
            </button>

            <button 
              onClick={() => scrollToSection('contact')}
              className="text-[14px] font-semibold text-slate-700 hover:text-primary-600 transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Contact Details & CTA */}
          <div className="hidden xl:flex items-center gap-5">
            <a 
              href={`tel:${BUSINESS_CONTACT.phoneRaw}`} 
              className="flex items-center gap-1.5 text-[14px] font-bold text-slate-900 hover:text-primary-600 transition-colors"
            >
              <Phone size={16} className="text-emerald-500 fill-emerald-500/20" />
              <span>{BUSINESS_CONTACT.phone}</span>
            </a>

            {/* Auth Dropdown or Button */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-[14px] font-bold text-slate-900 hover:text-primary-600 transition-colors py-2 cursor-pointer">
                  <User size={16} className="text-primary-600" />
                  <span>{userProfile?.fullName?.split(' ')[0] || 'Profile'}</span>
                </button>
                <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden z-50 p-1.5">
                  <button 
                    onClick={() => handleNavClick('orders')}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:text-primary-600 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Truck size={15} className="text-blue-600" />
                    <span>My Orders & Tracking</span>
                  </button>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <button 
                    onClick={logout} 
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={openAuthModal}
                className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 hover:text-primary-600 transition-colors cursor-pointer"
              >
                <User size={15} className="text-slate-400" />
                <span>Sign In</span>
              </button>
            )}

            <button 
              onClick={() => scrollToSection('contact')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-5 py-2.5 rounded-full font-bold text-[13px] shadow-sm hover:shadow transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Zap size={13} className="fill-white" />
              Get Free Quote
            </button>
          </div>

          {/* Mobile Actions Container */}
          <div className="xl:hidden flex items-center gap-2.5">
            <a 
              href="#store" 
              onClick={(e) => { e.preventDefault(); handleNavClick('store'); }} 
              className="flex items-center gap-1.5 bg-accent-500 text-slate-950 text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm"
            >
              <Package size={13} />
              <span>Bulk Combos</span>
            </a>

            <a 
              href={`tel:${BUSINESS_CONTACT.phoneRaw}`} 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-700"
              aria-label="Call Us"
            >
              <Phone size={16} className="text-emerald-600" />
            </a>
            
            {/* Mobile Menu Button */}
            <button 
              className="flex items-center justify-center w-9 h-9 text-slate-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[310] transition-opacity duration-300 xl:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <nav 
        className={`fixed top-[78px] bottom-0 left-0 w-[290px] bg-white z-[320] shadow-2xl transition-transform duration-300 ease-in-out xl:hidden flex flex-col p-6 overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-3">
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
            className="py-2.5 text-sm font-bold text-primary-600 border-b border-slate-100"
          >
            Home
          </a>
          
          {/* Mobile Mirror Solar Store Link */}
          <a 
            href="#store" 
            onClick={(e) => { e.preventDefault(); handleNavClick('store'); }} 
            className="py-3 px-4 bg-[#0A2540] text-white rounded-xl text-sm font-black flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-accent-500 flex items-center justify-center text-slate-950 text-xs">📦</span>
              <span>Mirror Solar Store</span>
            </span>
            <span className="text-[10px] bg-accent-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">Store</span>
          </a>

          {/* Mobile Track Orders Link */}
          <button 
            onClick={() => handleNavClick('orders')} 
            className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 rounded-xl text-xs font-extrabold flex items-center justify-between transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Truck size={16} className="text-blue-600" />
              <span>My Orders & Tracking</span>
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full uppercase">Track</span>
          </button>

          <button onClick={() => scrollToSection('projects')} className="py-2 text-left text-sm font-semibold text-slate-700 hover:text-primary-600">Projects</button>
          <button onClick={() => scrollToSection('testimonials')} className="py-2 text-left text-sm font-semibold text-slate-700 hover:text-primary-600">Testimonials</button>
          <button onClick={() => scrollToSection('contact')} className="py-2 text-left text-sm font-semibold text-slate-700 hover:text-primary-600 border-b border-slate-100 pb-3">Contact Us</button>
          
          <a href={`tel:${BUSINESS_CONTACT.phoneRaw}`} className="flex items-center gap-2 py-3 text-sm font-bold text-slate-900">
            <Phone size={17} className="text-emerald-500" />
            {BUSINESS_CONTACT.phone}
          </a>
          
          {/* Mobile Auth Section */}
          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 py-1 text-sm font-bold text-slate-900">
                  <User size={16} className="text-primary-600" />
                  Hi, {userProfile?.fullName?.split(' ')[0] || 'User'}
                </div>
                <button onClick={logout} className="text-left text-sm font-semibold text-red-600 hover:text-red-700">Sign Out</button>
              </div>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); openAuthModal(); }}
                className="flex items-center gap-2 py-2 text-sm font-bold text-slate-900"
              >
                <User size={16} className="text-slate-400" />
                Sign In / Register
              </button>
            )}
          </div>
          
          <button 
            onClick={() => scrollToSection('contact')}
            className="mt-4 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-full font-bold text-[14px] shadow-md"
          >
            <Zap size={14} className="fill-white" />
            Get Free Quote
          </button>
        </div>
      </nav>
    </>
  );
}
