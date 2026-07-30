import React from 'react';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-gray-300 pt-16" role="contentinfo">
      <div className="container-custom">
        {/* Newsletter Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex-1">
            <h3 className="text-xl font-heading font-bold text-white mb-2">Stay Updated with Solar Energy News from AP</h3>
            <p className="text-sm text-gray-400 max-w-[500px]">Get the latest information about APEPDCL net metering rules, PM Surya Ghar subsidy updates, solar maintenance tips, and new product launches from Mirror Solar Vision.</p>
          </div>
          <form className="flex w-full md:max-w-[400px] relative" aria-label="Newsletter signup">
            <input 
              type="email" 
              className="w-full bg-white/10 border border-white/10 text-white px-5 py-3 pr-[120px] rounded-full text-sm placeholder-gray-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20" 
              placeholder="Enter your email address" 
              aria-label="Email address" 
              required 
            />
            <button 
              type="submit" 
              className="absolute right-1 top-1 bottom-1 bg-accent-500 hover:bg-accent-600 text-white px-5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              Subscribe <Send size={14} />
            </button>
          </form>
        </div>

        {/* Footer Top Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] gap-8 pb-12">
          {/* Brand Col */}
          <div className="flex flex-col">
            <div className="mb-4">
              <img src="/assets/images/logo/msv_logo_500x300.png" alt="Mirror Solar Vision" className="h-24 w-auto mb-4" />
              <p className="text-sm leading-relaxed text-gray-400 max-w-[300px]">
                Mirror Solar Vision is the solar energy division of the Mirror Group, combining nearly 20 years of Mirror Aqua's water purification excellence with Tier-1 rooftop solar installations across all 26 districts of Andhra Pradesh. Government-approved PM Surya Ghar installer.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-accent-500 transition-colors" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="#" className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-accent-500 transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-white hover:bg-accent-500 transition-colors" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="flex flex-col">
            <h4 className="font-heading text-base font-semibold text-white mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[3px] after:bg-accent-500 after:rounded-full">Solar Solutions</h4>
            <div className="flex flex-col gap-3">
              <a href="#solutions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">3kW Residential Solar</a>
              <a href="#solutions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">5kW Residential Solar</a>
              <a href="#solutions" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">10kW Commercial Solar</a>
              <a href="#drain-clips" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">Dust & Water Drain Clips</a>
              <a href="#subsidy-guide" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">Rooftop Subsidies</a>
            </div>
          </div>

          {/* Links Col 2 */}
          <div className="flex flex-col">
            <h4 className="font-heading text-base font-semibold text-white mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[3px] after:bg-accent-500 after:rounded-full">Corporate Links</h4>
            <div className="flex flex-col gap-3">
              <a href="#why-choose-us" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">Why Choose Us</a>
              <a href="#gallery" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">Installation Showcase</a>
              <a href="#about-group" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">Parent Group Legacy</a>
              <a href="#availability-checker" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-accent-500 hover:pl-1 transition-all duration-150">AP Service Areas</a>
            </div>
          </div>

          {/* Contact Col */}
          <div className="flex flex-col">
            <h4 className="font-heading text-base font-semibold text-white mb-5 relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-[30px] after:h-[3px] after:bg-accent-500 after:rounded-full">Contact Details</h4>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 bg-white/10 rounded-lg shrink-0 text-accent-500">
                <MapPin size={16} />
              </div>
              <div className="text-sm leading-relaxed text-gray-400 pt-1">
                Mirror Solar Vision / Mirror Aqua,<br />
                Andhra Pradesh, India
              </div>
            </div>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 bg-white/10 rounded-lg shrink-0 text-accent-500">
                <Phone size={16} />
              </div>
              <div className="text-sm leading-relaxed text-gray-400 pt-1.5">
                <a href="tel:+91XXXXXXXXXX" className="text-gray-400 hover:text-accent-500 transition-colors">+91 XXXXX XXXXX</a>
              </div>
            </div>
            
            <div className="flex items-start gap-3 mb-4">
              <div className="flex items-center justify-center w-9 h-9 bg-white/10 rounded-lg shrink-0 text-accent-500">
                <Mail size={16} />
              </div>
              <div className="text-sm leading-relaxed text-gray-400 pt-1.5">
                <a href="mailto:info@mirrorsolarvision.com" className="text-gray-400 hover:text-accent-500 transition-colors">info@mirrorsolarvision.com</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GST Bar */}
      <div className="bg-white/5 border-t border-white/5 py-4 text-xs text-gray-500 text-center px-4">
        GST Registered: Mirror Aqua / Mirror Solar Vision • Andhra Pradesh State Jurisdiction • Registered PM Surya Ghar Installer • APEPDCL & APSPDCL Net Metering Partner
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-white/10 py-6">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-gray-400 font-semibold">Mirror Solar Vision</strong>. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-accent-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
