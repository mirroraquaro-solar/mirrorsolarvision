import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StoreTeaser({ onNavigateToStore }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredProducts = [
    {
      id: 'drain-clips',
      tag: 'Top Seller',
      category: 'Anti-Soiling Technology',
      title: 'MSV Heavy-Duty Drain Clips',
      desc: '30mm, 35mm & 40mm Compatible • 4 Clips per kW included',
      priceLabel: 'From',
      price: '₹25',
      unit: '/ clip',
      image: '/assets/images/001.png',
    },
    {
      id: 'cleaning-liquid',
      tag: 'New Arrival',
      category: 'Panel Care',
      title: 'MSV Premium Cleaning Liquid',
      desc: 'Removes stubborn dust and leaves an anti-static protective coating.',
      priceLabel: 'Only',
      price: '₹1,500',
      unit: '/ 1L bottle',
      image: '/assets/images/products/s1.jpeg',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
    }, 3500); // Slides every 3.5 seconds
    return () => clearInterval(timer);
  }, []);

  const currentProduct = featuredProducts[currentIndex];

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  return (
    <section className="section py-16 bg-white border-y border-gray-100 scroll-mt-20" id="store-banner" aria-label="Mirror Solar Store Teaser">
      <div className="container-custom">
        <div className="bg-gradient-to-br from-orange-50/90 via-amber-50/40 to-sky-50/60 rounded-3xl p-8 lg:p-12 text-slate-900 shadow-xl relative overflow-hidden border border-orange-100/80">
          
          {/* Soft solar glow lighting backdrops */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-accent-500/10 text-accent-600 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider border border-accent-500/20">
                <ShoppingBag size={14} className="fill-accent-500 text-accent-500" />
                <span>Official Accessories & Maintenance Shop</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-tight font-heading">
                Welcome to <span className="text-accent-500">Mirror Solar Store</span>
              </h2>

              <p className="text-sm md:text-base text-slate-600 font-normal leading-relaxed max-w-[600px]">
                Upgrade & protect your rooftop solar installation with original MSV anti-soiling drain clips, high-performance cleaning liquids, and weather-proof accessories.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => {
                    if (onNavigateToStore) {
                      onNavigateToStore('catalog');
                    } else {
                      window.location.hash = '#store';
                    }
                  }}
                  className="bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-white font-extrabold px-8 py-4 rounded-2xl flex items-center gap-3 shadow-accent text-base transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <ShoppingBag size={20} />
                  Visit Mirror Solar Store
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Side Visual Product Card Slideshow */}
            <div className="lg:col-span-5 relative">
              <div 
                onClick={() => {
                  if (onNavigateToStore) {
                    onNavigateToStore(currentProduct.id);
                  } else {
                    window.location.hash = `#${currentProduct.id}`;
                  }
                }}
                className="bg-white rounded-3xl p-6 text-slate-900 border border-slate-200/80 shadow-xl space-y-4 cursor-pointer group hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative"
              >
                {/* Slideshow Controls (Desktop) */}
                <button 
                  onClick={handlePrev}
                  className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white border border-slate-200 shadow-md rounded-full p-2 z-20 text-slate-600 hover:text-primary-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNext}
                  className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white border border-slate-200 shadow-md rounded-full p-2 z-20 text-slate-600 hover:text-primary-500 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
                >
                  <ChevronRight size={20} />
                </button>

                <span className="absolute top-4 right-4 bg-accent-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm z-10">
                  {currentProduct.tag}
                </span>

                {/* Animated Image Container */}
                <div key={`${currentProduct.id}-img`} className="bg-slate-50/80 rounded-2xl p-4 aspect-square flex items-center justify-center overflow-hidden border border-slate-100 animate-fade-in-up">
                  <img 
                    src={currentProduct.image} 
                    alt={currentProduct.title} 
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" 
                  />
                </div>

                {/* Animated Text Container */}
                <div key={`${currentProduct.id}-text`} className="text-left animate-fade-in-up">
                  <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">
                    {currentProduct.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-primary-500 transition-colors">
                    {currentProduct.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                    {currentProduct.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">{currentProduct.priceLabel}</span>
                    <strong className="text-xl font-black text-slate-950">
                      {currentProduct.price} <span className="text-xs text-slate-500 font-normal">{currentProduct.unit}</span>
                    </strong>
                  </div>
                  
                  <span className="bg-primary-500 group-hover:bg-primary-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 transition-colors shadow-sm">
                    Shop Now <ArrowRight size={14} />
                  </span>
                </div>
                
                {/* Dots indicator */}
                <div className="absolute bottom-[-24px] left-0 right-0 flex justify-center gap-2">
                  {featuredProducts.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-accent-500' : 'w-2 bg-slate-300'}`}
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
