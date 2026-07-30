import React from 'react';
import { Zap, ArrowRight, Calculator, Sun, Users, IndianRupee, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden flex items-start lg:items-center min-h-[100vh] lg:min-h-[700px] pt-[80px] scroll-mt-20" id="home" aria-label="Hero banner">
      
      {/* Background Image of House with Solar Panels */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/images/hero/hero-rooftop-solar.png" 
          alt="Rooftop solar installation background" 
          className="w-full h-full object-cover"
        />
        {/* Rich Slate-Blue Gradient Overlay: High opacity on the left, fading to low opacity on the right */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to right, rgba(8, 17, 36, 0.96) 0%, rgba(8, 17, 36, 0.85) 35%, rgba(8, 17, 36, 0.4) 70%, rgba(8, 17, 36, 0.05) 100%)'
        }}></div>
      </div>

      <div className="container-custom relative z-20 w-full flex flex-col lg:flex-row items-center justify-between gap-10 py-10 lg:py-16">
        
        {/* Left Side: Hero content */}
        <div className="flex-1 text-left max-w-[650px] mt-2 sm:mt-4 lg:mt-[-20px] flex flex-col justify-center h-full animate-fade-in-up">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-accent-500/10 px-4 py-2 rounded-full border border-accent-500/30 mb-10 sm:mb-12 text-[13px] font-bold text-accent-400 tracking-[0.5px] uppercase self-start">
            <Zap size={14} className="fill-accent-500 text-accent-500" />
            <span>Telangana & Andhra Pradesh's Leading Solar Partner</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[60px] font-extrabold text-white leading-tight tracking-tight mb-8 sm:mb-10">
            Power Your Home <br />
            <span className="text-accent-500">With The Sun</span>
          </h1>

          {/* Sub Bullets */}
          <div className="flex flex-wrap items-center gap-2 text-white font-semibold text-lg md:text-xl mb-10 sm:mb-12">
            <span>Save Energy</span>
            <span className="text-accent-500">•</span>
            <span>Save Money</span>
            <span className="text-accent-500">•</span>
            <span>Save The Planet</span>
          </div>
          
          <p className="text-[15px] md:text-[16px] text-gray-300 leading-relaxed mb-10 sm:mb-12 font-light">
            Join 200+ families across Telangana and Andhra Pradesh reducing their electricity bills by up to 90% with modern on-grid, off-grid, and hybrid solar panel systems.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] text-white px-8 py-4 rounded-full font-bold text-base hover:opacity-95 shadow-accent transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Get Free Quote <ArrowRight size={18} />
            </a>
            <a 
              href="#subsidy-guide" 
              className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-all duration-300"
            >
              <Calculator size={18} className="text-green-400" />
              Calculate Savings
            </a>
          </div>
        </div>
        
        {/* Right Side: PM Modi Hexagonal Portrait & Stats - Hidden on mobile/tablet, visible on desktop */}
        <div className="relative items-center justify-center shrink-0 w-full lg:w-[500px] h-[400px] lg:h-[440px] mt-6 lg:mt-[-20px] hidden lg:flex">
          
          {/* Stat 1: Top Left - Hidden on mobile/tablet */}
          <div className="absolute top-[8%] left-[2%] bg-white rounded-2xl shadow-xl p-3 items-center gap-3 z-20 min-w-[170px] border border-gray-100 animate-float hidden lg:flex">
            <div className="bg-orange-50 w-10 h-10 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
              <Sun size={20} className="fill-orange-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Solar Yield</span>
              <strong className="text-gray-900 text-sm font-extrabold block">10 MW+</strong>
            </div>
          </div>

          {/* Stat 2: Top Right - Hidden on mobile/tablet */}
          <div className="absolute top-[18%] right-[2%] bg-white rounded-2xl shadow-xl p-3 items-center gap-3 z-20 min-w-[170px] border border-gray-100 animate-float hidden lg:flex" style={{ animationDelay: '1.5s' }}>
            <div className="bg-green-50 w-10 h-10 rounded-xl flex items-center justify-center text-green-500 shrink-0">
              <Users size={20} className="fill-green-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Active Installs</span>
              <strong className="text-gray-900 text-sm font-extrabold block">200+ Installed</strong>
            </div>
          </div>

          {/* Stat 3: Bottom Left - Hidden on mobile/tablet */}
          <div className="absolute bottom-[16%] left-[2%] bg-white rounded-2xl shadow-xl p-3 items-center gap-3 z-20 min-w-[170px] border border-gray-100 animate-float hidden lg:flex" style={{ animationDelay: '3s' }}>
            <div className="bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
              <IndianRupee size={18} className="fill-blue-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Total Savings</span>
              <strong className="text-gray-900 text-sm font-extrabold block">₹2 Cr+ Saved</strong>
            </div>
          </div>

          {/* Stat 4: Bottom Right - Hidden on mobile/tablet */}
          <div className="absolute bottom-[6%] right-[2%] bg-white rounded-2xl shadow-xl p-3 items-center gap-3 z-20 min-w-[170px] border border-gray-100 animate-float hidden lg:flex" style={{ animationDelay: '4.5s' }}>
            <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck size={20} className="fill-emerald-100" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Warranty Cover</span>
              <strong className="text-gray-900 text-sm font-extrabold block">25-Year Protection</strong>
            </div>
          </div>

          {/* PM Modi Hexagon Graphic Box */}
          <div className="relative w-[240px] sm:w-[280px] h-[300px] sm:h-[340px] z-10">
            {/* Hexagonal Outer Frame */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-orange-500 to-emerald-500 p-[3px] [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] shadow-2xl">
              {/* Inner content clip */}
              <div className="w-full h-full bg-primary-950 [clip-path:polygon(50%_0%,_100%_25%,_100%_75%,_50%_100%,_0%_75%,_0%_25%)] overflow-hidden relative">
                <img 
                  src="/assets/images/logo/pm-modi.jpg" 
                  alt="PM Narendra Modi" 
                  className="w-full h-full object-cover object-top scale-105"
                />
                
                {/* Gradient fade overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-black/90 to-transparent"></div>
                
                {/* PM Badge inside Hexagon */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-white/10">
                    PM Narendra Modi
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Floating WhatsApp Widget */}
      <a 
        href="https://wa.me/919347416140" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] hover:bg-[#20BA56] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(37,211,102,0.4)] transition-all duration-300 transform hover:scale-110 hover:rotate-6 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

    </section>
  );
}
