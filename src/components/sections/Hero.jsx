import React from 'react';
import { Zap, ArrowRight, Package, Sun, Users, IndianRupee, ShieldCheck } from 'lucide-react';
import { BUSINESS_CONTACT } from '../../data/bulkComboData';

export default function Hero({ onNavigate }) {
  const handleStoreClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('store');
    } else {
      window.location.hash = '#store';
    }
  };

  const scrollToContact = (e) => {
    e.preventDefault();
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#contact';
    }
  };

  return (
    <section className="relative w-full overflow-hidden flex items-start lg:items-center min-h-[calc(100vh-80px)] lg:min-h-[700px] pt-4 sm:pt-8 lg:pt-10 scroll-mt-24 sm:scroll-mt-28" id="home" aria-label="Hero banner">
      
      {/* Background Image of House with Solar Panels */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/images/hero/hero-rooftop-solar.png" 
          alt="Rooftop solar installation background" 
          className="w-full h-full object-cover"
          fetchpriority="high"
          loading="eager"
          decoding="async"
        />
        {/* Rich Slate-Blue Gradient Overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, rgba(8, 17, 36, 0.96) 0%, rgba(8, 17, 36, 0.88) 40%, rgba(8, 17, 36, 0.45) 75%, rgba(8, 17, 36, 0.1) 100%)'
        }}></div>
      </div>

      <div className="container-custom relative z-20 w-full flex flex-col lg:flex-row items-center justify-between gap-10 py-10 lg:py-16">
        
        {/* Left Side: Hero content */}
        <div className="flex-1 text-left max-w-[650px] mt-2 sm:mt-4 lg:mt-[-20px] flex flex-col justify-center h-full animate-fade-in-up">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-accent-500/10 px-4 py-2 rounded-full border border-accent-500/30 mb-8 sm:mb-10 text-[13px] font-bold text-accent-400 tracking-[0.5px] uppercase self-start">
            <Zap size={14} className="fill-accent-500 text-accent-500" />
            <span>Andhra Pradesh's Leading Solar Partner</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[60px] font-black text-white leading-tight tracking-tight mb-6 sm:mb-8">
            Power Your Home <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-400 to-orange-400">
              With The Sun
            </span>
          </h1>

          {/* Sub Bullets */}
          <div className="flex flex-wrap items-center gap-2 text-white font-semibold text-lg md:text-xl mb-6 sm:mb-8">
            <span>Save Energy</span>
            <span className="text-accent-400">•</span>
            <span>Save Money</span>
            <span className="text-accent-400">•</span>
            <span>Save Future</span>
          </div>
          
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
            Join 1500+ families and commercial establishments across Andhra Pradesh reducing electricity bills by up to 90% with Tier-1 on-grid, off-grid, and hybrid solar systems. Powered by nearly 20 years of Mirror Aqua's trusted heritage.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <a 
              href="#contact" 
              onClick={scrollToContact}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-black text-sm sm:text-base shadow-accent transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Get Free Quote <ArrowRight size={18} />
            </a>
            <a 
              href="#store" 
              onClick={handleStoreClick}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/25 backdrop-blur-md text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Package size={18} className="text-accent-400" />
              <span>Solar Store</span>
            </a>
          </div>

          {/* Mobile Trust Badges Grid (Visible on mobile & tablets < lg) */}
          <div className="grid grid-cols-2 gap-2.5 pt-4 lg:hidden w-full">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="bg-orange-500/20 w-8 h-8 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                <Sun size={16} />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[9px] font-bold text-slate-300 block uppercase">Solar Yield</span>
                <strong className="text-white text-xs font-black block">10 MW+</strong>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="bg-emerald-500/20 w-8 h-8 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                <Users size={16} />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[9px] font-bold text-slate-300 block uppercase">Active Installs</span>
                <strong className="text-white text-xs font-black block">1500+ Families</strong>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="bg-blue-500/20 w-8 h-8 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                <IndianRupee size={15} />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[9px] font-bold text-slate-300 block uppercase">Total Savings</span>
                <strong className="text-white text-xs font-black block">₹2 Cr+ Saved</strong>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 flex items-center gap-2.5">
              <div className="bg-amber-500/20 w-8 h-8 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="text-left leading-tight">
                <span className="text-[9px] font-bold text-slate-300 block uppercase">Warranty</span>
                <strong className="text-white text-xs font-black block">25-Year Cover</strong>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side: PM Modi Hexagonal Portrait & Stats - Desktop view */}
        <div className="relative items-center justify-center shrink-0 w-full lg:w-[500px] h-[400px] lg:h-[440px] mt-6 lg:mt-[-20px] hidden lg:flex">
          
          {/* Stat 1: Top Left */}
          <div className="absolute top-[8%] left-[2%] bg-white rounded-2xl shadow-xl p-3.5 items-center gap-3 z-20 min-w-[170px] border border-slate-100 animate-float hidden lg:flex">
            <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
              <Sun size={20} className="fill-orange-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Solar Yield</span>
              <strong className="text-slate-900 text-sm font-black block">10 MW+</strong>
            </div>
          </div>

          {/* Stat 2: Top Right */}
          <div className="absolute top-[18%] right-[2%] bg-white rounded-2xl shadow-xl p-3.5 items-center gap-3 z-20 min-w-[170px] border border-slate-100 animate-float hidden lg:flex" style={{ animationDelay: '1.5s' }}>
            <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <Users size={20} className="fill-emerald-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Active Installs</span>
              <strong className="text-slate-900 text-sm font-black block">1500+ Families</strong>
            </div>
          </div>

          {/* Stat 3: Bottom Left */}
          <div className="absolute bottom-[16%] left-[2%] bg-white rounded-2xl shadow-xl p-3.5 items-center gap-3 z-20 min-w-[170px] border border-slate-100 animate-float hidden lg:flex" style={{ animationDelay: '3s' }}>
            <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <IndianRupee size={18} className="fill-blue-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Total Savings</span>
              <strong className="text-slate-900 text-sm font-black block">₹2 Cr+ Saved</strong>
            </div>
          </div>

          {/* Stat 4: Bottom Right */}
          <div className="absolute bottom-[6%] right-[2%] bg-white rounded-2xl shadow-xl p-3.5 items-center gap-3 z-20 min-w-[170px] border border-slate-100 animate-float hidden lg:flex" style={{ animationDelay: '4.5s' }}>
            <div className="bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck size={20} className="fill-amber-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">Warranty Cover</span>
              <strong className="text-slate-900 text-sm font-black block">25-Year Protection</strong>
            </div>
          </div>

          {/* PM Modi Hexagon Graphic Box */}
          <div className="relative w-[240px] sm:w-[280px] h-[300px] sm:h-[340px] z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-orange-500 to-emerald-500 p-[3px] [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] shadow-2xl">
              <div className="w-full h-full bg-slate-950 [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] overflow-hidden relative">
                <img 
                  src="/assets/images/logo/pm-modi.jpg" 
                  alt="PM Narendra Modi — PM Surya Ghar" 
                  className="w-full h-full object-cover object-top scale-105"
                />
                
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/90 to-transparent"></div>
                
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                    PM Narendra Modi
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
