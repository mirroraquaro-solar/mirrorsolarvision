import React, { useState, useEffect } from 'react';
import { Phone, Zap, Menu, X, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isAuthenticated, userProfile, openAuthModal, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (target, subView = 'catalog') => {
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(target, subView);
    } else {
      window.location.hash = target;
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[300] h-[75px] bg-white/90 backdrop-blur-[12px] border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'shadow-md bg-white/95 h-[65px]' : ''}`}>
        <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto px-4 sm:px-8">
          
          {/* Logo */}
          <a 
            href="#home" 
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }} 
            className="flex items-center gap-2 shrink-0 py-1 overflow-hidden"
          >
            <img 
              src="/assets/images/logo/msv_logo_500x300.png" 
              alt="Mirror Solar Vision Logo" 
              className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-[44px]' : 'h-[52px]'}`}
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6">
            <a 
              href="#home" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
              className="text-[14px] font-bold text-gray-900 hover:text-primary-500 transition-colors"
            >
              Home
            </a>


            {/* Mirror Solar Store Nav Button */}
            <a 
              href="#store" 
              onClick={(e) => { e.preventDefault(); handleNavClick('store', 'catalog'); }} 
              className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-white bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 px-3.5 py-1.5 rounded-full shadow-sm transition-all border border-primary-500/30"
            >
              <ShoppingBag size={14} className="text-accent-400 fill-accent-400" />
              <span>Mirror Solar Store</span>
            </a>


            <a 
              href="#projects" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('projects'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} 
              className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors"
            >
              Projects
            </a>
            <a 
              href="#testimonials" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('testimonials'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} 
              className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors"
            >
              Testimonials
            </a>
            <a 
              href="#contact" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('contact'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} 
              className="text-[14px] font-semibold text-gray-700 hover:text-primary-500 transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Contact Details & CTA */}
          <div className="hidden xl:flex items-center gap-6">
            <a href="tel:+918639103947" className="flex items-center gap-1.5 text-[14px] font-bold text-gray-950 hover:text-primary-500 transition-colors">
              <Phone size={16} className="text-green-500 fill-green-500/20" />
              <span>+91 86391 03947</span>
            </a>
            {/* Auth Dropdown or Button */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-[14px] font-bold text-gray-950 hover:text-primary-500 transition-colors">
                  <User size={16} className="text-primary-500" />
                  <span>{userProfile?.fullName?.split(' ')[0] || 'Profile'}</span>
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                  <a href="#profile" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-500 font-medium">My Profile</a>
                  <a href="#orders" onClick={(e) => { e.preventDefault(); handleNavClick('orders'); }} className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-500 font-medium">My Orders</a>
                  <button onClick={logout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-100">Sign Out</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={openAuthModal}
                className="flex items-center gap-1.5 text-[14px] font-bold text-gray-950 hover:text-primary-500 transition-colors"
              >
                <User size={16} className="text-gray-400" />
                <span>Sign In</span>
              </button>
            )}

            <a 
              href="#contact" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('contact'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-accent-500 to-[#F58220] hover:from-[#F58220] hover:to-accent-500 text-white px-5 py-2.5 rounded-full font-bold text-[13px] shadow-accent hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Zap size={12} className="fill-white" />
              Get Free Quote
            </a>
          </div>

          {/* Mobile Actions Container */}
          <div className="xl:hidden flex items-center gap-3">
            <a 
              href="#store" 
              onClick={(e) => { e.preventDefault(); handleNavClick('store', 'catalog'); }} 
              className="flex items-center gap-1.5 bg-primary-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
            >
              <ShoppingBag size={14} />
              <span>Store</span>
            </a>

            <a 
              href="tel:+918639103947" 
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
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
            className="py-2 text-sm font-bold text-primary-500 border-b border-gray-100"
          >
            Home
          </a>
          
          {/* Mobile Mirror Solar Store Link */}
          <a 
            href="#store" 
            onClick={(e) => { e.preventDefault(); handleNavClick('store', 'catalog'); }} 
            className="py-2.5 px-3 bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl text-sm font-extrabold flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-accent-400" />
              Mirror Solar Store
            </span>
            <span className="text-[10px] bg-accent-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">Shop</span>
          </a>


          <a href="#projects" onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('projects'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">Projects</a>
          <a href="#testimonials" onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('testimonials'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500">Testimonials</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('contact'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500 border-b border-gray-100 pb-4">Contact</a>
          
          <a href="tel:+918639103947" className="flex items-center gap-2 py-3 text-sm font-bold text-gray-900 mt-2">
            <Phone size={18} className="text-green-500 fill-green-500/20" />
            +91 86391 03947
          </a>
          
          {/* Mobile Auth Section */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            {isAuthenticated ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2 py-3 text-sm font-bold text-gray-900">
                  <User size={18} className="text-primary-500" />
                  Hi, {userProfile?.fullName?.split(' ')[0] || 'User'}
                </div>
                <a href="#profile" className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500 pl-7">My Profile</a>
                <a href="#orders" onClick={(e) => { e.preventDefault(); handleNavClick('orders'); }} className="py-2 text-sm font-semibold text-gray-700 hover:text-primary-500 pl-7">My Orders</a>
                <button onClick={logout} className="text-left py-2 text-sm font-semibold text-red-600 hover:text-red-700 pl-7 mt-2">Sign Out</button>
              </div>
            ) : (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); openAuthModal(); }}
                className="flex items-center gap-2 py-3 text-sm font-bold text-gray-900"
              >
                <User size={18} className="text-gray-400" />
                Sign In / Register
              </button>
            )}
          </div>
          
          <a 
            href="#contact" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); setTimeout(() => { const el = document.getElementById('contact'); if(el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
            className="mt-6 flex items-center justify-center gap-2 w-full bg-gradient-to-r from-accent-500 to-[#F58220] text-white px-6 py-3 rounded-full font-bold text-[14px] shadow-accent"
          >
            <Zap size={14} className="fill-white" />
            Get Free Quote
          </a>
        </div>
      </nav>
    </>
  );
}
