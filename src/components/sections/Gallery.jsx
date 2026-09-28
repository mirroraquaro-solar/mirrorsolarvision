import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Gallery() {
  const slides = [
    { img: '/assets/images/gallery/plant-bhaskar.webp', alt: '3kW rooftop solar installation by Mirror Solar Vision for Bhaskar Rao' },
    { img: '/assets/images/gallery/plant-ramarao.webp', alt: '5kW rooftop solar plant installed by Mirror Solar Vision for Ch Rama Rao' },
    { img: '/assets/images/gallery/plant-syamala.webp', alt: 'Rooftop solar installation for Eddireddy Syamala by Mirror Solar Vision' },
    { img: '/assets/images/gallery/plant-antharvedi.webp', alt: 'Net metering solar installation for Gantasala family in Antharvedi' },
    { img: '/assets/images/gallery/plant-prasad.webp', alt: 'Completed rooftop solar installation for Voruganti Prasad in Rajahmundry' },
    { img: '/assets/images/gallery/1.webp', alt: '3kW rooftop solar installation in Pragadavaram' },
    { img: '/assets/images/gallery/2.webp', alt: '5kW residential solar installation in K.amberpeta' },
    { img: '/assets/images/gallery/3.webp', alt: '5kW elevated rooftop solar installation in K.amberpeta' },
    { img: '/assets/images/gallery/4.webp', alt: '3kW residential solar installation in Vatluru' },
    { img: '/assets/images/gallery/5.webp', alt: '5kW residential solar installation in Payikapuram' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const gotoSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="section py-16 bg-gray-50 border-y border-gray-100 scroll-mt-24 sm:scroll-mt-28" id="projects" aria-label="Real solar installation project gallery across Andhra Pradesh">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-600 bg-accent-500/10 px-3 py-1.5 rounded-full">Verified Installation Portfolio — Real AP Projects</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Our Solar Installation Showcase — Real Projects Across Andhra Pradesh</h2>
        </div>

        <div className="relative max-w-[900px] mx-auto overflow-hidden rounded-3xl border border-gray-100 shadow-2xl bg-black/5 group">
          {/* Slides Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-[300px] sm:h-[500px]" 
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((slide, idx) => (
              <div key={idx} className="w-full shrink-0 h-full flex items-center justify-center bg-black/10">
                <img 
                  src={slide.img} 
                  alt={slide.alt} 
                  width="800"
                  height="500"
                  className="max-w-full max-h-full object-contain" 
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 w-11 h-11 rounded-full flex items-center justify-center border border-gray-100 shadow-md backdrop-blur-sm transition-transform active:scale-95 z-30 cursor-pointer" 
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Right Arrow Button */}
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 w-11 h-11 rounded-full flex items-center justify-center border border-gray-100 shadow-md backdrop-blur-sm transition-transform active:scale-95 z-30 cursor-pointer" 
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Pagination Dots with Accessible Touch Targets */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 z-30 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {slides.map((_, idx) => (
              <button 
                key={idx}
                className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-full cursor-pointer transition focus:outline-none" 
                onClick={() => gotoSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-accent-500 scale-125' : 'bg-white/70 hover:bg-white'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
