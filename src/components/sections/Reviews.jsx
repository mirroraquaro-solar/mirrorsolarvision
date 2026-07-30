import React from 'react';
import { Star } from 'lucide-react';

export default function Reviews() {
  const testimonials = [
    {
      stars: 5,
      text: "We installed a 3kW on-grid system with Mirror Solar Vision in Rajahmundry. Our monthly electricity bill dropped from ₹4,800 to approximately ₹350. The PM Surya Ghar subsidy of ₹78,000 was credited directly to my bank account within 35 days of DISCOM inspection. The team handled every document and approval. Highly professional service.",
      avatar: "VR",
      name: "Voruganti Rama Prasad",
      location: "Rajahmundry, AP"
    },
    {
      stars: 5,
      text: "We chose Mirror Solar Vision for our 5kW installation because of the trust we have in Mirror Aqua’s water purifiers — we've been using their products for over 10 years. The solar team handled the complete structural setup, electrical certifications, and APEPDCL net metering approval. Our electricity bill has been effectively zero for the past 4 months.",
      avatar: "BK",
      name: "Bala Krishna",
      location: "Kakinada, AP"
    },
    {
      stars: 5,
      text: "Net metering installation was completed smoothly by the Mirror Solar team. Our galvanized mounting structure has survived two heavy monsoon seasons and a cyclone warning without any leaks or structural issues. The panel cleaning is minimal because of the drain clips they recommended. Very responsive after-sales support.",
      avatar: "GA",
      name: "Gantasala Antharvedi",
      location: "Amalapuram, AP"
    },
    {
      stars: 5,
      text: "Installed a 5kW on-grid system in Eluru, West Godavari. The installation workmanship is top-notch. Cables are neatly routed through heavy-duty conduits and the structural safety matches global standards. The team was extremely polite and answered all my technical questions. The Wi-Fi telemetry is super clean.",
      avatar: "SR",
      name: "Srinivasa Rao",
      location: "Eluru, AP"
    },
    {
      stars: 5,
      text: "We set up a 10kW commercial system for our local clinic in Vijayawada. Our billing went down by nearly 85%, saving us thousands of rupees every month. The return on investment is extremely fast. Mirror Solar Vision handled the DISCOM integration seamlessly. Highly recommend them for commercial systems.",
      avatar: "DR",
      name: "Dr. K. S. Murthy",
      location: "Vijayawada, AP"
    },
    {
      stars: 5,
      text: "Excellent service from start to finish. They did a free site survey, provided a detailed CAD drawing of the panel placement, and executed the project in just 4 days. The PM Surya Ghar subsidy process was fully online and tracked by their back-office team. Best solar team in Andhra Pradesh.",
      avatar: "NS",
      name: "N. Satyanarayana",
      location: "Visakhapatnam, AP"
    }
  ];

  // Duplicate the list to create an infinite loop marquee scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="section py-16 bg-white overflow-hidden scroll-mt-20" id="testimonials" aria-label="Customer reviews and testimonials from verified solar installations in Andhra Pradesh">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">Verified Customer Testimonials from Across AP</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">What Our Customers Say About Mirror Solar Vision</h2>
        </div>

        {/* Local Styles for Infinite Marquee Scroll */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 12px)); }
          }
          .reviews-marquee-container {
            display: flex;
            width: max-content;
            gap: 24px;
            animation: marquee-scroll 45s linear infinite;
          }
          .reviews-marquee-container:hover {
            animation-play-state: paused;
          }
        `}} />

        {/* Scrolling Ticker Box */}
        <div className="relative w-full overflow-hidden py-4 mask-gradient">
          <div className="reviews-marquee-container">
            {duplicatedTestimonials.map((t, idx) => (
              <div 
                key={idx} 
                className="w-[300px] sm:w-[420px] shrink-0 bg-gray-50 border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between whitespace-normal"
              >
                <div>
                  <div className="flex gap-1 mb-3 text-orange-400">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={16} className="fill-orange-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic mb-6">
                    "{t.text}"
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-auto border-t border-gray-200/50 pt-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 shrink-0 text-sm">
                    {t.avatar}
                  </div>
                  <div className="leading-tight text-left">
                    <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
                    <span className="text-[10px] text-gray-400">{t.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
