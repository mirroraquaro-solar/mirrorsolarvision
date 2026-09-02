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
    <footer className="bg-slate-950 text-slate-300 pt-16 border-t border-slate-900" role="contentinfo">
      <div className="container-custom">
        
        {/* Newsletter & Official YouTube / Instagram Channels Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 space-y-6 mb-12">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-lg md:text-xl font-heading font-extrabold text-white mb-1.5">
                Stay Updated with Solar Energy News from Andhra Pradesh
              </h3>
              <p className="text-xs md:text-sm text-slate-400 max-w-[550px] mx-auto lg:mx-0">
                Get the latest information regarding APEPDCL, APCPDCL & APSPDCL net metering rules, PM Surya Ghar subsidy notifications, and bulk solar material updates from Mirror Solar Vision.
              </p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to Mirror Solar Vision updates.'); }} className="flex w-full lg:max-w-[420px] relative" aria-label="Newsletter signup">
              <input 
                type="email" 
                className="w-full bg-slate-900/90 border border-slate-700 text-white px-5 py-3 pr-[120px] rounded-full text-sm placeholder-slate-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500" 
                placeholder="Enter your email address" 
                aria-label="Email address" 
                required 
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1 bottom-1 bg-accent-500 hover:bg-accent-600 text-slate-950 px-5 rounded-full text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
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
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* YouTube Subscribe Button */}
              <a 
                href="https://youtube.com/@mirrorlife123?si=CREJrBVy3AYRHlGI" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 bg-[#CC0000] hover:bg-[#B30000] text-white font-black px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white font-black px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-x-8 gap-y-10 pb-12">
          
          {/* Brand Col with Crisp High-Res Logo */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-4 flex flex-col items-center lg:items-start">
              {/* Crisp, clean logo container with minimal padding & large 2x logo */}
              <div className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-md inline-flex items-center justify-center mb-4 transition-transform hover:scale-105">
                <img 
                  src="/assets/images/logo/mirror_solar-removebg-preview.png" 
                  alt="Mirror Solar Vision Logo" 
                  className="h-24 sm:h-28 md:h-36 w-auto object-contain max-w-[300px] scale-105" 
                />
              </div>
              <p className="text-xs leading-relaxed text-slate-400 max-w-[340px]">
                Mirror Solar Vision is the solar energy division of the Mirror Group, backed by nearly 20 years of Mirror Aqua's trusted service heritage across all 26 districts of Andhra Pradesh.
              </p>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start gap-3 mt-2">
              <a 
                href={`https://wa.me/${BUSINESS_CONTACT.phoneRaw}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-[#25D366] transition-colors" 
                aria-label="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a 
                href="https://www.facebook.com/share/1Efjcqhpeq/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 transition-colors" 
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/mirror_life_technologies?igsh=MTVyd3g0d2h5dXFsZg==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-pink-600 transition-colors" 
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a 
                href="https://youtube.com/@mirrorlife123?si=CREJrBVy3AYRHlGI" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-red-600 transition-colors" 
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.498 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center lg:items-start">
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-center lg:text-left">
              <li>
                <a href="#home" className="hover:text-accent-400 transition-colors">Home</a>
              </li>
              <li>
                <a href="#why-choose-us" className="hover:text-accent-400 transition-colors">Why Choose Us</a>
              </li>
              <li>
                <a href="#subsidy-guide" className="hover:text-accent-400 transition-colors">PM Surya Ghar Subsidy</a>
              </li>
              <li>
                <a href="#projects" className="hover:text-accent-400 transition-colors">Projects</a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-accent-400 transition-colors">Testimonials</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-accent-400 transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          {/* Solar Store Links */}
          <div className="flex flex-col items-center lg:items-start">
            <h4 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">
              Solar Store
            </h4>
            <ul className="space-y-2.5 text-xs text-center lg:text-left">
              <li>
                <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors flex items-center gap-1.5 justify-center lg:justify-start">
                  <Package size={12} className="text-accent-500" />
                  <span>Store Catalog</span>
                </a>
              </li>
              <li>
                <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors">
                  Drain Clips (30-40mm)
                </a>
              </li>
              <li>
                <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors">
                  Panel Cleaner Liquid (1L)
                </a>
              </li>
              <li>
                <a href="#store" onClick={handleStoreClick} className="hover:text-accent-400 transition-colors">
                  ₹15,000 Bulk Combo
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col items-center lg:items-start text-xs text-slate-400 space-y-3 text-center lg:text-left">
            <h4 className="text-white font-bold text-sm mb-1 tracking-wider uppercase">
              Head Office
            </h4>
            
            <div className="flex items-start gap-2.5 justify-center lg:justify-start">
              <MapPin size={15} className="text-accent-500 shrink-0 mt-0.5" />
              <span>{BUSINESS_CONTACT.address}</span>
            </div>

            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <Phone size={15} className="text-accent-500 shrink-0" />
              <a href={`tel:${BUSINESS_CONTACT.phoneRaw}`} className="hover:text-white transition-colors">{BUSINESS_CONTACT.phone}</a>
            </div>

            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <Mail size={15} className="text-accent-500 shrink-0" />
              <a href={`mailto:${BUSINESS_CONTACT.email}`} className="hover:text-white transition-colors">{BUSINESS_CONTACT.email}</a>
            </div>
          </div>

        </div>

      </div>

      {/* Compliance / GST Bar */}
      <div className="bg-slate-900 border-t border-slate-800/80 py-3.5 text-[11px] text-slate-400 text-center px-4">
        GST Registered: Mirror Aqua / Mirror Solar Vision • Andhra Pradesh State Jurisdiction • Registered PM Surya Ghar Muft Bijli Yojana Installer • APEPDCL, APCPDCL & APSPDCL Net Metering
      </div>

      {/* Footer Bottom Copyright */}
      <div className="border-t border-slate-900 py-5 text-center text-xs text-slate-500">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-slate-400 font-semibold">Mirror Solar Vision</strong>. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-slate-500">Fast dispatch across all 26 AP districts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
