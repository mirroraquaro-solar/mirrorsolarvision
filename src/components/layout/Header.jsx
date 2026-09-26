import React, { useState, useEffect, useRef } from 'react';
import { Phone, Zap, Menu, X, ShoppingBag, User, Truck, ChevronDown, Sun, Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { BUSINESS_CONTACT } from '../../data/bulkComboData';

export default function Header({ onNavigate }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { isAuthenticated, userProfile, openAuthModal, logout } = useAuth();
  const { totalItemsCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (target) => {
    setIsMobileMenuOpen(false);
    setIsStoreDropdownOpen(false);
    if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.hash = target;
    }
  };

  const scrollToSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    setIsStoreDropdownOpen(false);
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
          isScrolled ? 'shadow-md h-[72px] sm:h-[78px]' : 'h-[80px] sm:h-[90px]'
        }`}
      >
        <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto px-3.5 sm:px-8">
          
          {/* Logo with strict containment */}
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
              style={{
                height: isScrolled ? '46px' : '54px',
                maxHeight: isScrolled ? '46px' : '54px',
                width: 'auto',
                maxWidth: '200px',
                objectFit: 'contain'
              }}
              className="w-auto transition-all duration-300"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6">
            <a 
              href="#home" 
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
              className="text-[14px] font-bold text-slate-800 hover:text-primary-600 transition-colors"
            >
              Home
            </a>

            {/* Dual Products / Store Dropdown Navigation */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
                onMouseEnter={() => {
                  setIsStoreDropdownOpen(true);
                  import('../sections/MirrorSolarStore');
                  import('../sections/MirrorAquaStore');
                }}
                className="inline-flex items-center gap-2 text-[14px] font-bold text-white bg-gradient-to-r from-[#0A2540] via-[#0F3460] to-[#0A2540] hover:shadow-lg px-4.5 py-2 rounded-full shadow-sm transition-all duration-200 transform hover:scale-105 cursor-pointer border border-slate-700/40"
              >
                <span className="w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center text-slate-950 text-[11px] font-black">🛒</span>
                <span>Products</span>
                <span className="text-[10px] bg-accent-500/20 text-accent-300 font-extrabold px-1.5 py-0.5 rounded-full border border-accent-400/30 uppercase">2 Categories</span>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-200 ${isStoreDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Products Dropdown Menu */}
              {isStoreDropdownOpen && (
                <div 
                  onMouseLeave={() => setIsStoreDropdownOpen(false)}
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[350] p-2 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Product Categories
                  </div>

                  {/* Option 1: Solar Products */}
                  <a
                    href="#store"
                    onClick={(e) => { e.preventDefault(); handleNavClick('store'); }}
                    onMouseEnter={() => import('../sections/MirrorSolarStore')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/80 transition-colors group cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Sun size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 group-hover:text-amber-700">Solar Products</span>
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">Solar</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">MSV Drain Clips & Bulk Combos</p>
                    </div>
                  </a>

                  {/* Option 2: Mirror Aqua Products */}
                  <a
                    href="#aqua-store"
                    onClick={(e) => { e.preventDefault(); handleNavClick('aqua-store'); }}
                    onMouseEnter={() => import('../sections/MirrorAquaStore')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-cyan-50/80 transition-colors group cursor-pointer mt-1"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                      <Droplets size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 group-hover:text-cyan-700">Mirror Aqua Products</span>
                        <span className="text-[9px] font-bold bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded-full">Aqua</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">10" 5-Micron PP Spun Filter (120g)</p>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Track Order Direct Link */}
            <a 
              href="#orders" 
              onClick={(e) => { e.preventDefault(); handleNavClick('orders'); }} 
              onMouseEnter={() => import('../checkout/MyOrders')}
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-slate-800 hover:text-primary-600 transition-colors"
            >
              <Truck size={15} className="text-primary-600" />
              <span>Track Order</span>
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

          {/* Desktop Right: Master Cart, Auth & Call */}
          <div className="hidden xl:flex items-center gap-4">
            {/* Master Cart Icon Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag size={16} className="text-slate-700" />
              <span>Cart</span>
              {totalItemsCount > 0 && (
                <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
                  {totalItemsCount}
                </span>
              )}
            </button>

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

          {/* Mobile Right Actions Container */}
          <div className="xl:hidden flex items-center gap-2">
            {/* Mobile Master Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-800 active:scale-95 transition-all"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag size={17} />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Stores Quick Action */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#0A2540] to-[#0F3460] active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-all"
            >
              <span>Stores</span>
              <ChevronDown size={13} />
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="flex items-center justify-center w-8 h-8 text-slate-900 focus:outline-none cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[310] transition-opacity duration-300 xl:hidden ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <nav 
        className={`fixed ${isScrolled ? 'top-[72px] sm:top-[78px]' : 'top-[80px] sm:top-[90px]'} bottom-0 left-0 w-[300px] bg-white z-[320] shadow-2xl transition-all duration-300 ease-in-out xl:hidden flex flex-col p-5 overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-3">
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
            className="py-2 text-sm font-bold text-primary-600 border-b border-slate-100"
          >
            Home
          </a>
          
          {/* Mobile Online Categories Heading */}
          <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider pt-1">
            Product Categories
          </div>

          {/* Mobile Mirror Solar Store Link */}
          <a 
            href="#store" 
            onClick={(e) => { e.preventDefault(); handleNavClick('store'); }} 
            className="py-2.5 px-3.5 bg-[#0A2540] text-white rounded-xl text-xs font-black flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Sun size={15} className="text-amber-400" />
              <span>Solar Products</span>
            </span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">Solar</span>
          </a>

          {/* Mobile Mirror Aqua Store Link */}
          <a 
            href="#aqua-store" 
            onClick={(e) => { e.preventDefault(); handleNavClick('aqua-store'); }} 
            className="py-2.5 px-3.5 bg-gradient-to-r from-cyan-900 to-blue-900 text-white rounded-xl text-xs font-black flex items-center justify-between shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Droplets size={15} className="text-cyan-300" />
              <span>Mirror Aqua (120g Filter)</span>
            </span>
            <span className="text-[9px] bg-cyan-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">Aqua</span>
          </a>

          {/* Mobile Track Orders Link */}
          <button 
            onClick={() => handleNavClick('orders')} 
            className="py-2 px-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 rounded-xl text-xs font-extrabold flex items-center justify-between transition-colors text-left"
          >
            <span className="flex items-center gap-2">
              <Truck size={15} className="text-blue-600" />
              <span>My Orders & Tracking</span>
            </span>
            <span className="text-[9px] bg-blue-100 text-blue-700 font-black px-2 py-0.5 rounded-full uppercase">Track</span>
          </button>

          <button onClick={() => scrollToSection('projects')} className="py-2 text-left text-sm font-semibold text-slate-700 hover:text-primary-600">Projects</button>
          <button onClick={() => scrollToSection('testimonials')} className="py-2 text-left text-sm font-semibold text-slate-700 hover:text-primary-600">Testimonials</button>
          <button onClick={() => scrollToSection('contact')} className="py-2 text-left text-sm font-semibold text-slate-700 hover:text-primary-600 border-b border-slate-100 pb-3">Contact Us</button>
          
          <a href={`tel:${BUSINESS_CONTACT.phoneRaw}`} className="flex items-center gap-2 py-3 text-sm font-bold text-slate-900">
            <Phone size={17} className="text-emerald-500" />
            {BUSINESS_CONTACT.phone}
          </a>
        </div>
      </nav>
    </>
  );
}
