import React from 'react';
import { ShieldCheck, FileCheck, PlugZap, HeartHandshake } from 'lucide-react';

export default function WhyChooseUs() {
  const cards = [
    {
      icon: <ShieldCheck size={24} />,
      title: "25-Year Performance Warranty",
      desc: "Every solar panel we install comes with a manufacturer-backed 25-year performance warranty guaranteeing at least 80% output in Year 25. We use only Tier-1 panels from globally certified manufacturers — no local rebrands or grey-market modules."
    },
    {
      icon: <FileCheck size={24} />,
      title: "End-to-End PM Surya Ghar Processing",
      desc: "We handle every step of your government subsidy application — from National Portal registration to DISCOM inspection scheduling and subsidy disbursement tracking. No middlemen. No extra charges. The subsidy (up to ₹78,000) is credited directly to your bank account."
    },
    {
      icon: <PlugZap size={24} />,
      title: "APEPDCL & APSPDCL Net Metering",
      desc: "Complete integration with AP's power distribution companies. We manage the technical feasibility report, meter testing, and bi-directional meter installation so you earn grid export credits on every unit of surplus power your solar system generates."
    },
    {
      icon: <HeartHandshake size={24} />,
      title: "Backed by Mirror Aqua's 20-Year Legacy",
      desc: "Mirror Solar Vision is powered by the Mirror Group — the same team behind Mirror Aqua's nearly two decades of water purification excellence across Andhra Pradesh. When you choose us, you choose a company that has earned its reputation through long-term service, not sales pitches."
    }
  ];

  return (
    <section className="section py-16 bg-white overflow-hidden scroll-mt-20" id="why-choose-us" aria-label="Why choose Mirror Solar Vision for your rooftop solar installation">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">Why Homeowners Across AP Trust Us</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Why Choose Mirror Solar Vision for Your Rooftop Solar Installation?</h2>
          <p className="text-base text-gray-600 leading-relaxed hidden md:block">We are not just another solar installer. Mirror Solar Vision combines deep engineering expertise, end-to-end government subsidy processing, and the trusted legacy of Mirror Aqua to deliver rooftop solar systems built for Andhra Pradesh's unique climate — hot, humid, and cyclone-prone.</p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 snap-x snap-mandatory scrollbar-hide select-none">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="w-full shrink-0 snap-center md:w-auto bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
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
