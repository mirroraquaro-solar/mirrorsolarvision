import React from 'react';
import { Send, MapPin, Phone, Mail, Package } from 'lucide-react';
import { BUSINESS_CONTACT } from '../../data/bulkComboData';

export default function Footer({ onNavigate }) {
  const handleStoreClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('store');
    } else {
      window.location.hash = '#store';
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-10 sm:pt-16 border-t border-slate-900 pb-20 sm:pb-0" role="contentinfo">
      <div className="container-custom px-4 sm:px-6">
        
        {/* Newsletter & Official YouTube / Instagram Channels Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 mb-8 sm:mb-12">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-base sm:text-lg md:text-xl font-heading font-extrabold text-white mb-1.5">
                Stay Updated with Solar Energy News from Andhra Pradesh
              </h3>
              <p className="text-xs md:text-sm text-slate-400 max-w-[550px] mx-auto lg:mx-0 leading-relaxed">
                Get the latest information regarding APEPDCL, APCPDCL & APSPDCL net metering rules, PM Surya Ghar subsidy notifications, and bulk solar material updates from Mirror Solar Vision.
              </p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Mirror Solar Vision updates.'); }} className="flex flex-col sm:flex-row w-full lg:max-w-[440px] relative gap-2 sm:gap-0" aria-label="Newsletter signup">
              <input 
                type="email" 
                className="w-full bg-slate-900/90 border border-slate-700 text-white px-4 sm:px-5 py-3 sm:pr-[120px] rounded-xl sm:rounded-full text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500" 
                placeholder="Enter your email address" 
                aria-label="Email address" 
                required 
              />
              <button 
                type="submit" 
                className="sm:absolute sm:right-1 sm:top-1 sm:bottom-1 bg-accent-500 hover:bg-accent-600 text-slate-950 py-2.5 sm:py-0 px-5 rounded-xl sm:rounded-full text-xs font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-md"
              >
                Subscribe <Send size={13} />
              </button>
            </form>
          </div>

          {/* Direct YouTube and Instagram Subscription Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] text-center sm:text-left">
              Follow & Subscribe Our Official Channels:
            </span>
            
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center justify-center gap-2.5 w-full sm:w-auto">
              {/* YouTube Subscribe Button */}
              <a 
                href="https://youtube.com/@mirrorlife123?si=CREJrBVy3AYRHlGI" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#B30000] text-white font-black px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer active:scale-95 w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Subscribe on YouTube</span>
              </a>

              {/* Instagram Follow Button */}
              <a 
                href="https://www.instagram.com/mirror_life_technologies?igsh=MTVyd3g0d2h5dXFsZg==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white font-black px-4 py-2.5 rounded-xl text-xs transition shadow-sm cursor-pointer active:scale-95 w-full sm:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span>Follow on Instagram</span>
              </a>
            </div>
          </div>

        </div>

        {/* Footer Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-x-8 gap-y-8 sm:gap-y-10 pb-10 sm:pb-12">
          
          {/* Brand Col with Crisp High-Res Logo */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-4 flex flex-col items-center lg:items-start">
              {/* Crisp, clean logo container with minimal padding */}
              <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-md inline-flex items-center justify-center mb-3 sm:mb-4 transition-transform hover:scale-105">
                <img 
                  src="/assets/images/logo/mirror_solar-removebg-preview.png" 
                  alt="Mirror Solar Vision Logo" 
                  className="h-20 sm:h-28 md:h-36 w-auto object-contain max-w-[240px] sm:max-w-[300px] scale-105" 
                />
              </div>
              <p className="text-xs leading-relaxed text-slate-400 max-w-[340px]">
                Mirror Solar Vision is the solar energy division of the Mirror Group, backed by nearly 20 years of Mirror Aqua's trusted service heritage across all 26 districts of Andhra Pradesh.
              </p>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-1 sm:mt-2">
              <a 
                href={`https://wa.me/${BUSINESS_CONTACT.phoneRaw}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-[#25D366] transition-colors" 
                aria-label="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/share/1Efjcqhpeq/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 transition-colors" 
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/mirror_life_technologies?igsh=MTVyd3g0d2h5dXFsZg==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-pink-600 transition-colors" 
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com/@mirrorlife123?si=CREJrBVy3AYRHlGI" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-red-600 transition-colors" 
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Container on Mobile: 2 Columns for quick access */}
          <div className="grid grid-cols-2 gap-6 sm:contents">
            {/* Quick Links */}
            <div className="flex flex-col items-start text-left">
              <h4 className="text-white font-bold text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider uppercase border-b border-accent-500/40 sm:border-0 pb-1 sm:pb-0 w-full">
                Quick Links
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs">
                <li>
                  <a href="#home" className="hover:text-accent-400 transition-colors py-0.5 inline-block">Home</a>
                </li>
                <li>
                  <a href="#why-choose-us" className="hover:text-accent-400 transition-colors py-0.5 inline-block">Why Us</a>
                </li>
                <li>
                  <a href="#subsidy-guide" className="hover:text-accent-400 transition-colors py-0.5 inline-block">PM Subsidy</a>
                </li>
                <li>
                  <a href="#projects" className="hover:text-accent-400 transition-colors py-0.5 inline-block">Projects</a>
                </li>
                <li>
                  <a href="#testimonials" className="hover:text-accent-400 transition-colors py-0.5 inline-block">Reviews</a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-accent-400 transition-colors py-0.5 inline-block">Contact</a>
                </li>
              </ul>
            </div>

            {/* Solar Store Links */}
            <div className="flex flex-col items-start text-left">
              <h4 className="text-white font-bold text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider uppercase border-b border-accent-500/40 sm:border-0 pb-1 sm:pb-0 w-full">
                Solar Store
              </h4>
              <ul className="space-y-2 sm:space-y-2.5 text-xs">
                <li>
                  <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors flex items-center gap-1.5 py-0.5">
                    <Package size={12} className="text-accent-500 shrink-0" />
                    <span>Catalog</span>
                  </a>
                </li>
                <li>
                  <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors py-0.5 inline-block">
                    Drain Clips
                  </a>
                </li>
                <li>
                  <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors py-0.5 inline-block">
                    Panel Cleaner
                  </a>
                </li>
                <li>
                  <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors py-0.5 inline-block">
                    ₹15k Combo
                  </a>
                </li>
                <li>
                  <a 
                    href="#orders" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if (onNavigate) {
                        onNavigate('orders');
                      } else {
                        window.location.hash = '#orders';
                      }
                    }} 
                    className="text-accent-400 font-semibold hover:underline py-0.5 inline-block"
                  >
                    Track Orders →
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col items-center sm:items-start text-xs text-slate-400 space-y-3 text-center sm:text-left bg-white/[0.02] sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-white/5 sm:border-0">
            <h4 className="text-white font-bold text-xs sm:text-sm mb-1 tracking-wider uppercase">
              Head Office
            </h4>
            
            <div className="flex items-start gap-2.5 justify-center sm:justify-start">
              <MapPin size={16} className="text-accent-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{BUSINESS_CONTACT.address}</span>
            </div>

            <div className="flex items-center gap-2.5 justify-center sm:justify-start">
              <Phone size={15} className="text-accent-500 shrink-0" />
              <a href={`tel:${BUSINESS_CONTACT.phoneRaw}`} className="hover:text-white transition-colors font-medium">{BUSINESS_CONTACT.phone}</a>
            </div>

            <div className="flex items-center gap-2.5 justify-center sm:justify-start">
              <Mail size={15} className="text-accent-500 shrink-0" />
              <a href={`mailto:${BUSINESS_CONTACT.email}`} className="hover:text-white transition-colors">{BUSINESS_CONTACT.email}</a>
            </div>
          </div>

        </div>

      </div>

      {/* Compliance / GST Bar */}
      <div className="bg-slate-900 border-t border-slate-800/80 py-3.5 text-[10px] sm:text-[11px] text-slate-400 text-center px-4 leading-relaxed">
        GST Registered: Mirror Aqua / Mirror Solar Vision • Andhra Pradesh State Jurisdiction • Registered PM Surya Ghar Muft Bijli Yojana Installer • APEPDCL, APCPDCL & APSPDCL Net Metering
      </div>

      {/* Footer Bottom Copyright */}
      <div className="border-t border-slate-900 py-4 sm:py-5 text-center text-xs text-slate-500">
        <div className="container-custom px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <p className="text-[11px] sm:text-xs">
            &copy; {new Date().getFullYear()} <strong className="text-slate-400 font-semibold">Mirror Solar Vision</strong>. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-slate-400 sm:text-slate-500 text-[11px] sm:text-xs font-medium">Fast dispatch across all 26 AP districts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
