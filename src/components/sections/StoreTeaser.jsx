import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Star 
} from 'lucide-react';
import { CONFIRMED_BULK_COMBO, INDIVIDUAL_PRODUCTS } from '../../data/bulkComboData';

export default function StoreTeaser({ onNavigateToStore }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = 2;

  const combo = CONFIRMED_BULK_COMBO;
  const drainClips = INDIVIDUAL_PRODUCTS.find(p => p.id === 'msv-drain-clips') || INDIVIDUAL_PRODUCTS[0];

  const handleGoToStore = () => {
    if (onNavigateToStore) {
      onNavigateToStore();
    } else {
      window.location.hash = '#store';
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  // Autoplay: slide right to left every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section 
      className="section py-12 lg:py-16 bg-slate-50 border-b border-slate-200/80 scroll-mt-20 relative overflow-hidden" 
      id="bulk-combos" 
      aria-label="Mirror Solar Store Products Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-accent-600 bg-accent-500/10 px-3.5 py-1.5 rounded-full border border-accent-500/20 inline-flex items-center gap-1.5">
            <Package size={13} className="text-accent-600" />
            <span>Store Catalog</span>
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Mirror Solar Store Products
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            Explore our genuine solar accessories, drain clips, and complete installation combos.
          </p>
        </div>

        {/* Quick Product Tabs on Top for Instant Mobile Navigation */}
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto mb-5 px-2">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs sm:text-sm font-black transition-all cursor-pointer truncate ${
              currentSlide === 0
                ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            1. Drain Clips
          </button>
          <button
            onClick={() => setCurrentSlide(1)}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs sm:text-sm font-black transition-all cursor-pointer truncate ${
              currentSlide === 1
                ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            2. Bulk Combo
          </button>
        </div>

        {/* Carousel Viewport Container */}
        <div className="max-w-5xl mx-auto relative px-0 sm:px-12">
          
          {/* Previous Slide Arrow */}
          <button
            onClick={prevSlide}
            aria-label="Previous Product"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-md hover:shadow-lg flex items-center justify-center transition-all cursor-pointer hidden sm:flex"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Next Slide Arrow */}
          <button
            onClick={nextSlide}
            aria-label="Next Product"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-md hover:shadow-lg flex items-center justify-center transition-all cursor-pointer hidden sm:flex"
          >
            <ChevronRight size={22} />
          </button>

          {/* Slider Slides Track */}
          <div className="overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >

              {/* ========================================================= */}
              {/* SLIDE 1: MSV HEAVY-DUTY DRAIN CLIPS */}
              {/* ========================================================= */}
              <div className="w-full flex-shrink-0">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-8 md:p-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center">
                    
                    {/* Left: Drain Clips Image Container (5 cols) */}
                    <div className="md:col-span-5 space-y-2">
                      <div 
                        onClick={handleGoToStore}
                        className="bg-slate-50 border border-slate-100 rounded-2xl p-3 sm:p-5 h-44 sm:h-52 md:h-auto md:aspect-square flex items-center justify-center relative overflow-hidden cursor-pointer group hover:bg-slate-100/60 transition"
                      >
                        <img 
                          src={drainClips.images[0]} 
                          alt={drainClips.name} 
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" 
                        />
                        <span className="absolute top-2.5 left-2.5 bg-accent-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {drainClips.tag}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-bold">
                        <span className="text-slate-400">Sizes:</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">30mm</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">33mm</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">35mm</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">40mm</span>
                      </div>
                    </div>

                    {/* Right: Product Details & CTAs (7 cols) */}
                    <div className="md:col-span-7 space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#0A2540] text-white text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          DRAIN CLIPS
                        </span>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>4.9</span>
                          <span className="text-slate-400 font-medium">(128 reviews)</span>
                        </div>
                      </div>

                      <div>
                        <h3 
                          onClick={handleGoToStore}
                          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-heading cursor-pointer hover:text-primary-600 transition"
                        >
                          {drainClips.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {drainClips.shortDesc}
                        </p>
                      </div>

                      {/* Highlights */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 sm:p-4 space-y-1.5 text-xs font-bold text-slate-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>4 Clips per 1 kW (₹25/clip)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>3kW, 4kW, 5kW, 10kW & Manual kW</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>UV-Stabilized High Polymer</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>10+ Years Weather Resistance</span>
                          </div>
                        </div>
                      </div>

                      {/* Price & Actions */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Starting From</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-black text-slate-950 font-heading">₹300</span>
                            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">(3 kW / 12 Clips)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={handleGoToStore}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>VIEW IN STORE</span>
                            <ArrowRight size={14} />
                          </button>
                          <button
                            onClick={handleGoToStore}
                            className="bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl text-xs sm:text-sm transition shadow-accent cursor-pointer text-center"
                          >
                            ORDER NOW
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SLIDE 2: BULK SOLAR INSTALLATION COMBO */}
              {/* ========================================================= */}
              <div className="w-full flex-shrink-0">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-8 md:p-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center">
                    
                    {/* Left: 6 Product Images Collage with Count Badges (5 cols) */}
                    <div className="md:col-span-5 space-y-2">
                      <div 
                        onClick={handleGoToStore}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2 sm:p-3 cursor-pointer group hover:border-primary-500 hover:shadow-md transition"
                      >
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
                          {combo.materialsIncluded.map((mat) => (
                            <div key={mat.id} className="bg-white rounded-xl p-1 sm:p-1.5 border border-slate-200/70 flex flex-col items-center justify-center shadow-xs">
                              <img src={mat.image} alt={mat.name} className="h-8 sm:h-10 w-auto object-contain" />
                              <span className="text-[8px] sm:text-[9px] font-black text-primary-700 bg-primary-50 px-1 rounded mt-0.5 truncate">{mat.countLabel}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 text-center font-medium">
                        Complete Hardware & Accessory Kit for Installers
                      </p>
                    </div>

                    {/* Right: Product Details & CTAs (7 cols) */}
                    <div className="md:col-span-7 space-y-3 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-accent-500 text-slate-950 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          BULK OFFER
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full">
                          Ready for Dispatch
                        </span>
                      </div>

                      <div>
                        <h3 
                          onClick={handleGoToStore}
                          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-heading cursor-pointer hover:text-primary-600 transition"
                        >
                          Bulk Solar Installation Combo
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          Essential solar installation materials bundled together in one ready-to-order package.
                        </p>
                      </div>

                      {/* Concise Materials Summary */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 sm:p-4 space-y-1.5 text-xs font-bold text-slate-800">
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {combo.materialsIncluded.map((mat) => (
                            <div key={mat.id} className="flex items-center gap-1.5">
                              <CheckCircle2 size={13} className="text-primary-600 shrink-0" />
                              <span className="truncate">{mat.displayQty}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action Buttons */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Combo Price</span>
                          <span className="text-2xl sm:text-3xl font-black text-slate-950 font-heading">₹15,000</span>
                        </div>

                        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={handleGoToStore}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>VIEW COMBO</span>
                            <ArrowRight size={14} />
                          </button>
                          <button
                            onClick={handleGoToStore}
                            className="bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black px-4 py-2.5 sm:px-5 sm:py-3.5 rounded-xl text-xs sm:text-sm transition shadow-accent cursor-pointer text-center"
                          >
                            ORDER NOW
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Navigation Dots / Pills Indicator */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[0, 1].map((idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentSlide === idx 
                    ? 'w-8 h-2.5 bg-primary-600' 
                    : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
