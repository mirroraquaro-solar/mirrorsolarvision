import React, { useState, useEffect } from 'react';
import { Filter, Layers, Zap, CheckCircle, RefreshCw, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';
import './ProductLanding.css';

export function BenefitsSection({ benefits = [] }) {
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const defaultBenefits = [
    {
      title: '5-Micron Precision Capture',
      description: 'Traps pipe rust, silt, coarse sand, and physical suspended impurities down to 5µm.',
      icon: <Filter size={22} />
    },
    {
      title: '100% Virgin Polypropylene',
      description: 'Zero chemical binders, adhesives, or toxic additives. Pure food-grade media.',
      icon: <Layers size={22} />
    },
    {
      title: 'Multi-Layer Depth Density',
      description: 'Outer fibers catch large grit; progressive dense core captures fine colloidal dust.',
      icon: <Zap size={22} />
    },
    {
      title: 'Universal 10-Inch Drop-In Fit',
      description: 'Engineered to fit all standard 10-inch domestic and light-commercial purifier bowls.',
      icon: <CheckCircle size={22} />
    },
    {
      title: 'Quick 2-Minute Maintenance',
      description: 'Tool-free, straightforward cartridge swap during routine service intervals.',
      icon: <RefreshCw size={22} />
    },
    {
      title: 'Protects Downstream Purifier Stages',
      description: 'Safeguards downstream booster pumps, internal filters, and fine filtration elements from premature clogging.',
      icon: <ShieldCheck size={22} />
    }
  ];

  const displayBenefits = benefits.length === 6 ? benefits.map((b, i) => ({
    ...b,
    icon: defaultBenefits[i].icon
  })) : defaultBenefits;

  // Mobile Bottom-to-Top auto-slider (moves to next benefit every 3.5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveMobileIdx((prev) => (prev + 1) % displayBenefits.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, displayBenefits.length]);

  const handleNext = () => {
    setActiveMobileIdx((prev) => (prev + 1) % displayBenefits.length);
  };

  const handlePrev = () => {
    setActiveMobileIdx((prev) => (prev - 1 + displayBenefits.length) % displayBenefits.length);
  };

  return (
    <section className="benefits-section" id="benefits">
      <div className="container">
        <div className="section-header text-center max-w-2xl mx-auto mb-8">
          <span className="section-eyebrow">ENGINEERED PERFORMANCE</span>
          <h2 className="section-title">
            6 Factual Technical Benefits
          </h2>
          <p className="section-subtitle text-slate-600 text-xs sm:text-sm mt-1.5">
            Reliable 120g pre-filtration media engineered for consistent flow rates and high dirt-holding capacity.
          </p>
        </div>

        {/* Desktop 3x2 Grid */}
        <div className="benefits-cards-grid hidden md:grid">
          {displayBenefits.map((item, idx) => (
            <div key={idx} className="benefit-card">
              <div className="benefit-card-number">0{idx + 1}</div>
              <div className="benefit-icon-box">{item.icon}</div>
              <h3 className="benefit-card-title">{item.title}</h3>
              <p className="benefit-card-desc">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Mobile Vertical Bottom-to-Top Auto Slider */}
        <div 
          className="md:hidden relative max-w-sm mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Vertical Slider Card Container */}
          <div className="relative h-[220px] overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 shadow-md flex flex-col justify-between">
            
            {/* Animated Bottom-to-Top Slide Content */}
            <div 
              key={activeMobileIdx} 
              className="animate-in slide-in-from-bottom duration-500 fill-mode-forwards space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center">
                  {displayBenefits[activeMobileIdx].icon}
                </div>
                <span className="text-xs font-black text-cyan-600 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                  Benefit 0{activeMobileIdx + 1} / 06
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                  {displayBenefits[activeMobileIdx].title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  {displayBenefits[activeMobileIdx].description}
                </p>
              </div>
            </div>

            {/* Bottom Stepper & Nav Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {/* Stepper Dots */}
              <div className="flex items-center gap-1.5">
                {displayBenefits.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveMobileIdx(dotIdx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeMobileIdx === dotIdx ? 'w-6 bg-cyan-600' : 'w-1.5 bg-slate-200'
                    }`}
                    aria-label={`Go to benefit ${dotIdx + 1}`}
                  />
                ))}
              </div>

              {/* Vertical Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  aria-label="Previous Benefit"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  aria-label="Next Benefit (Bottom to Top)"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

          </div>

          <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
            Auto-sliding vertically (Bottom ➔ Top) • Tap or swipe to browse
          </p>
        </div>

      </div>
    </section>
  );
}
