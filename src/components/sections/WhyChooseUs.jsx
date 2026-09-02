import React, { useState } from 'react';
import { ShieldCheck, FileCheck, PlugZap, HeartHandshake, ChevronLeft, ChevronRight } from 'lucide-react';

export default function WhyChooseUs() {
  const [activeTab, setActiveTab] = useState(0);

  const cards = [
    {
      tabName: "25-Yr Warranty",
      icon: <ShieldCheck size={24} />,
      title: "25-Year Performance Warranty",
      desc: "Every solar panel we install comes with a manufacturer-backed 25-year performance warranty guaranteeing at least 80% output in Year 25. We use only Tier-1 panels from globally certified manufacturers — no local rebrands or grey-market modules."
    },
    {
      tabName: "PM Surya Ghar",
      icon: <FileCheck size={24} />,
      title: "End-to-End PM Surya Ghar Processing",
      desc: "We handle every step of your government subsidy application — from National Portal registration to DISCOM inspection scheduling and subsidy disbursement tracking. No middlemen. No extra charges. The subsidy (up to ₹78,000) is credited directly to your bank account."
    },
    {
      tabName: "Net Metering",
      icon: <PlugZap size={24} />,
      title: "APEPDCL, APCPDCL & APSPDCL Net Metering",
      desc: "Complete integration with AP's power distribution companies — APEPDCL, APCPDCL & APSPDCL. We manage the technical feasibility report, meter testing, and bi-directional meter installation so you earn grid export credits on every unit of surplus power your solar system generates."
    },
    {
      tabName: "20-Yr Legacy",
      icon: <HeartHandshake size={24} />,
      title: "Backed by Mirror Aqua's 20-Year Legacy",
      desc: "Mirror Solar Vision is powered by the Mirror Group — the same team behind Mirror Aqua's nearly two decades of water purification excellence across Andhra Pradesh. When you choose us, you choose a company that has earned its reputation through long-term service, not sales pitches."
    }
  ];

  return (
    <section className="section py-16 bg-white overflow-hidden scroll-mt-20" id="why-choose-us" aria-label="Why choose Mirror Solar Vision for your rooftop solar installation">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center max-w-[800px] mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">
            Why Homeowners Across AP Trust Us
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-3">
            Why Choose Mirror Solar Vision for Your Rooftop Solar Installation?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            We combine deep engineering expertise, end-to-end government subsidy processing, and the trusted legacy of Mirror Aqua to deliver rooftop solar systems built for Andhra Pradesh's unique climate — hot, humid, and cyclone-prone.
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MOBILE VIEW: Small Title Tabs & Card with Dots Navigation */}
        {/* ------------------------------------------------------------- */}
        <div className="block md:hidden space-y-4">
          
          {/* Small Title Pills to click and view other cards */}
          <div className="grid grid-cols-2 gap-2">
            {cards.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer truncate ${
                  activeTab === i
                    ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {c.tabName}
              </button>
            ))}
          </div>

          {/* Active Card on Mobile */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm relative transition-all duration-300">
            <div className="bg-primary-50 text-primary-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
              {cards[activeTab].icon}
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">
              {cards[activeTab].title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {cards[activeTab].desc}
            </p>

            {/* Navigation Arrows & Dots */}
            <div className="flex items-center justify-between pt-5 mt-4 border-t border-gray-200/80">
              <button
                onClick={() => setActiveTab(prev => (prev - 1 + cards.length) % cards.length)}
                aria-label="Previous Feature"
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5">
                {cards.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveTab(dotIdx)}
                    aria-label={`Go to feature ${dotIdx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      activeTab === dotIdx 
                        ? 'w-6 h-2 bg-primary-600' 
                        : 'w-2 h-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveTab(prev => (prev + 1) % cards.length)}
                aria-label="Next Feature"
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DESKTOP VIEW: Clean 4-Column Grid */}
        {/* ------------------------------------------------------------- */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="bg-primary-50 text-primary-500 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
