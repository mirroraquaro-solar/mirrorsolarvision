import React, { useState, useMemo } from 'react';
import { Star, ShieldCheck, MapPin, Zap, Award, CheckCircle2, Pause, Play, Sparkles } from 'lucide-react';

export default function Reviews() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = useMemo(() => [
    {
      id: 'rev-rajahmundry-1',
      stars: 5,
      category: 'subsidy',
      systemType: '3kW On-Grid Rooftop',
      billImpact: '₹4,800 ➔ ₹350 / mo',
      subsidy: '₹78,000 Subsidy Credited',
      text: 'We installed a 3kW on-grid system with Mirror Solar Vision in Rajahmundry. Our monthly electricity bill dropped from ₹4,800 to approximately ₹350. The PM Surya Ghar subsidy of ₹78,000 was credited directly to my bank account within 35 days of DISCOM inspection. The team handled every document and approval. Highly professional service.',
      avatar: 'VR',
      avatarBg: 'from-blue-600 to-indigo-700',
      name: 'Voruganti Rama Prasad',
      location: 'Rajahmundry, East Godavari',
      date: 'Verified Rooftop Owner'
    },
    {
      id: 'rev-kakinada-1',
      stars: 5,
      category: 'residential',
      systemType: '5kW Residential Solar',
      billImpact: 'Zero Bill for 4 Months',
      subsidy: '₹78,000 Subsidy Credited',
      text: "We chose Mirror Solar Vision for our 5kW installation because of the trust we have in Mirror Aqua’s water purifiers — we've been using their products for over 10 years. The solar team handled the complete structural setup, electrical certifications, and APEPDCL net metering approval. Our electricity bill has been effectively zero for the past 4 months.",
      avatar: 'BK',
      avatarBg: 'from-emerald-600 to-teal-700',
      name: 'Bala Krishna',
      location: 'Kakinada, Kakinada Dist',
      date: 'Verified Installation'
    },
    {
      id: 'rev-amalapuram-1',
      stars: 5,
      category: 'hardware',
      systemType: '3kW Rooftop + Drain Clips',
      billImpact: '92% Bill Reduction',
      subsidy: 'Cyclone-Proof Structure',
      text: 'Net metering installation was completed smoothly by the Mirror Solar team. Our galvanized mounting structure has survived two heavy monsoon seasons and a cyclone warning without any leaks or structural issues. The panel cleaning is minimal because of the MSV drain clips they recommended. Very responsive after-sales support.',
      avatar: 'GA',
      avatarBg: 'from-amber-600 to-orange-700',
      name: 'Gantasala Antharvedi',
      location: 'Amalapuram, Konaseema',
      date: 'Verified Installation'
    },
    {
      id: 'rev-eluru-1',
      stars: 5,
      category: 'residential',
      systemType: '5kW On-Grid System',
      billImpact: '₹6,200 ➔ ₹420 / mo',
      subsidy: 'Wi-Fi Telemetry Included',
      text: 'Installed a 5kW on-grid system in Eluru, West Godavari. The installation workmanship is top-notch. Cables are neatly routed through heavy-duty conduits and the structural safety matches global standards. The team was extremely polite and answered all my technical questions. The Wi-Fi telemetry is super clean.',
      avatar: 'SR',
      avatarBg: 'from-cyan-600 to-blue-700',
      name: 'Srinivasa Rao',
      location: 'Eluru, West Godavari',
      date: 'Verified Rooftop Owner'
    },
    {
      id: 'rev-vijayawada-1',
      stars: 5,
      category: 'commercial',
      systemType: '10kW Commercial Clinic',
      billImpact: '85% Commercial Bill Cut',
      subsidy: 'DISCOM Approval in 10 Days',
      text: 'We set up a 10kW commercial system for our local clinic in Vijayawada. Our billing went down by nearly 85%, saving us thousands of rupees every month. The return on investment is extremely fast. Mirror Solar Vision handled the DISCOM integration seamlessly. Highly recommend them for commercial systems.',
      avatar: 'DR',
      avatarBg: 'from-purple-600 to-violet-800',
      name: 'Dr. K. S. Murthy',
      location: 'Vijayawada, NTR District',
      date: 'Commercial Client'
    },
    {
      id: 'rev-vizag-1',
      stars: 5,
      category: 'subsidy',
      systemType: '5kW Residential Rooftop',
      billImpact: '₹5,600 ➔ ₹280 / mo',
      subsidy: '₹78,000 Subsidy Received',
      text: 'Excellent service from start to finish. They did a free site survey, provided a detailed CAD drawing of the panel placement, and executed the project in just 4 days. The PM Surya Ghar subsidy process was fully online and tracked by their back-office team. Best solar team in Andhra Pradesh.',
      avatar: 'NS',
      avatarBg: 'from-rose-600 to-pink-700',
      name: 'N. Satyanarayana',
      location: 'Visakhapatnam, Vizag',
      date: 'Verified Rooftop Owner'
    },
    {
      id: 'rev-tirupati-1',
      stars: 5,
      category: 'subsidy',
      systemType: '3kW On-Grid System',
      billImpact: '₹3,900 ➔ ₹190 / mo',
      subsidy: '₹78,000 Direct DBT',
      text: 'Mirror Solar Vision took care of everything from PM Surya Ghar registration to APSPDCL bi-directional net meter installation in Tirupati. The subsidy was directly credited to our SBI account. Output is steady at 14–15 units per day.',
      avatar: 'HR',
      avatarBg: 'from-amber-600 to-yellow-700',
      name: 'C. Harish Kumar Reddy',
      location: 'Tirupati, Rayalaseema',
      date: 'Verified Rooftop Owner'
    },
    {
      id: 'rev-guntur-1',
      stars: 5,
      category: 'residential',
      systemType: '6kW Dual Rooftop',
      billImpact: '₹7,100 ➔ ₹380 / mo',
      subsidy: 'Dual Inverter Setup',
      text: 'We installed 6kW on our house and small flour mill in Guntur. Durgarao garu personally guided the load calculation and inverter sizing. We are generating over 28 units every single day. True peace of mind with 25-year panel warranty.',
      avatar: 'VS',
      avatarBg: 'from-indigo-600 to-blue-800',
      name: 'V. Subba Rao',
      location: 'Guntur, Guntur Dist',
      date: 'Verified Installation'
    },
    {
      id: 'rev-nellore-1',
      stars: 5,
      category: 'hardware',
      systemType: '4kW Rooftop + MSV Clips',
      billImpact: '90% Energy Savings',
      subsidy: 'Monocrystalline DCR Panels',
      text: 'In Nellore heat, panel efficiency drops if dust builds up. MSV drain clips keep our panels 100% sludge free every morning. The installation quality with SS304 nuts and bolts is unmatched. Zero rusting even near the coast.',
      avatar: 'KP',
      avatarBg: 'from-teal-600 to-emerald-800',
      name: 'K. Pullaiah Naidu',
      location: 'Nellore, SPSR Nellore',
      date: 'Verified Installation'
    },
    {
      id: 'rev-kurnool-1',
      stars: 5,
      category: 'commercial',
      systemType: '10kW Cold Storage Solar',
      billImpact: '₹42,000 ➔ ₹6,500 / mo',
      subsidy: '3-Phase Heavy Duty Grid',
      text: 'Installed a 10kW solar system for our agri-storage unit in Kurnool. The solar generation offsets our heavy daytime daytime cooling loads. The electricity bill plummeted by over ₹35,000 each month. Massive savings for our business.',
      avatar: 'TR',
      avatarBg: 'from-sky-600 to-blue-800',
      name: 'T. Raghavendra',
      location: 'Kurnool, Kurnool Dist',
      date: 'Commercial Client'
    },
    {
      id: 'rev-bhimavaram-1',
      stars: 5,
      category: 'commercial',
      systemType: '5kW Aqua Farm Setup',
      billImpact: '₹8,500 ➔ ₹600 / mo',
      subsidy: 'Continuous Day Power',
      text: 'Our shrimp hatchery lab in Bhimavaram needed reliable power. Mirror Solar Vision designed an elevated structure that keeps our roof space fully accessible. Generation is super consistent and panels stay crystal clear.',
      avatar: 'CV',
      avatarBg: 'from-emerald-700 to-green-900',
      name: 'Ch. Venkata Ratnam',
      location: 'Bhimavaram, West Godavari',
      date: 'Verified Client'
    },
    {
      id: 'rev-tanuku-1',
      stars: 5,
      category: 'subsidy',
      systemType: '3kW Residential Setup',
      billImpact: '₹4,100 ➔ ₹210 / mo',
      subsidy: '₹78,000 Subsidy Credited',
      text: 'No running around offices or paying middlemen. Mirror Solar Vision uploaded our electricity bill, Aadhaar, and bank passbook, and handled DISCOM inspection within 18 days. Subsidy credited on time. Best experience.',
      avatar: 'PL',
      avatarBg: 'from-orange-600 to-red-700',
      name: 'P. Lakshmana Murthy',
      location: 'Tanuku, West Godavari',
      date: 'Verified Rooftop Owner'
    },
    {
      id: 'rev-ongole-1',
      stars: 5,
      category: 'hardware',
      systemType: 'Bulk Combo & Drain Clips',
      billImpact: 'EPC Contractor Kit',
      subsidy: '100% SS304 Hardware',
      text: 'We are solar EPC contractors doing installations across Prakasam district. The ₹15,000 Bulk Combo with MC4 pairs, anchor bolts, and drain clips gives us everything in one sturdy carton. Fast delivery and reliable hardware.',
      avatar: 'MS',
      avatarBg: 'from-violet-600 to-purple-800',
      name: 'M. Seshagiri Rao',
      location: 'Ongole, Prakasam',
      date: 'Solar EPC Installer'
    },
    {
      id: 'rev-kadapa-1',
      stars: 5,
      category: 'subsidy',
      systemType: '3kW PM Surya Ghar',
      billImpact: '₹3,600 ➔ ₹150 / mo',
      subsidy: '₹78,000 Direct DBT',
      text: 'Super fast installation in Kadapa. From token booking to final net metering synchronization took less than 3 weeks. Our meter now spins backwards during sunny hours. Very happy with Durgarao garu and his team.',
      avatar: 'SA',
      avatarBg: 'from-blue-700 to-indigo-900',
      name: 'S. Anand Babu',
      location: 'Kadapa, YSR District',
      date: 'Verified Rooftop Owner'
    },
    {
      id: 'rev-machilipatnam-1',
      stars: 5,
      category: 'residential',
      systemType: '4kW Coastal Rooftop',
      billImpact: '₹5,100 ➔ ₹320 / mo',
      subsidy: 'Corrosion-Proof Anodized',
      text: 'Living near the sea in Machilipatnam, corrosion was our biggest worry. Mirror Solar Vision used hot-dip galvanized mounting structures with SS304 fasteners. Panels have survived coastal winds without a single issue.',
      avatar: 'KR',
      avatarBg: 'from-teal-700 to-cyan-800',
      name: 'K. Ramakrishna',
      location: 'Machilipatnam, Krishna Dist',
      date: 'Verified Rooftop Owner'
    },
    {
      id: 'rev-anantapur-1',
      stars: 5,
      category: 'commercial',
      systemType: '8kW Commercial Office',
      billImpact: '₹14,200 ➔ ₹1,100 / mo',
      subsidy: 'High Efficiency Monocrystalline',
      text: 'Anantapur has abundant sunshine, and our 8kW system generates over 38 units on clear days. The mobile app lets us track real-time power generation. Highly dependable engineering and clean finish.',
      avatar: 'DP',
      avatarBg: 'from-amber-700 to-orange-800',
      name: 'D. Prasanna Kumar',
      location: 'Anantapur, Rayalaseema',
      date: 'Commercial Client'
    }
  ], []);

  // Filter testimonials based on selected tab
  const filteredTestimonials = useMemo(() => {
    if (activeCategory === 'all') return testimonials;
    return testimonials.filter(t => t.category === activeCategory);
  }, [activeCategory, testimonials]);

  // Duplicate list to create a flawless infinite loop auto-sliding left to right
  const duplicatedList = useMemo(() => {
    return [...filteredTestimonials, ...filteredTestimonials];
  }, [filteredTestimonials]);

  const categories = [
    { id: 'all', label: 'All Reviews', count: testimonials.length },
    { id: 'subsidy', label: 'PM Surya Ghar (₹78k Subsidy)', count: testimonials.filter(t => t.category === 'subsidy').length },
    { id: 'residential', label: 'Residential Rooftop (2–6kW)', count: testimonials.filter(t => t.category === 'residential').length },
    { id: 'commercial', label: 'Commercial & Clinics (8–15kW)', count: testimonials.filter(t => t.category === 'commercial').length },
    { id: 'hardware', label: 'Drain Clips & Hardware Kits', count: testimonials.filter(t => t.category === 'hardware').length }
  ];

  return (
    <section 
      className="section py-16 sm:py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden scroll-mt-20 border-y border-gray-100" 
      id="testimonials" 
      aria-label="Customer reviews and testimonials from verified solar installations in Andhra Pradesh"
    >
      <div className="container-custom">
        {/* Header and Trust Indicators */}
        <div className="text-center max-w-[840px] mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-600 bg-accent-50 border border-accent-200/60 px-3.5 py-1.5 rounded-full shadow-xs mb-3.5">
            <Sparkles size={14} className="text-accent-500 animate-pulse" />
            <span>10,000+ Happy Customers Across 26 Districts of Andhra Pradesh</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Real Stories, Real Savings Across AP
          </h2>
          
          <p className="text-sm sm:text-base text-gray-600 mt-3.5 max-w-2xl mx-auto leading-relaxed">
            See how homeowners, businesses, and solar installers across Andhra Pradesh slashed their electricity bills to near zero with <strong className="text-primary-700 font-semibold">Mirror Solar Vision</strong>.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200/80 text-left">
            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">4.98 / 5.0</div>
              <div className="text-[11px] text-gray-500 font-medium">2,840+ Verified Ratings</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                <ShieldCheck size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Direct DBT</span>
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">₹78,000 Subsidy</div>
              <div className="text-[11px] text-gray-500 font-medium">100% Approval Assistance</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-xs">
              <div className="flex items-center gap-1.5 text-primary-600 mb-1">
                <Zap size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700">DISCOM Sync</span>
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">₹0 Energy Bills</div>
              <div className="text-[11px] text-gray-500 font-medium">APEPDCL & APSPDCL Net Meter</div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-gray-200/70 shadow-xs">
              <div className="flex items-center gap-1.5 text-accent-600 mb-1">
                <Award size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">Mirror Quality</span>
              </div>
              <div className="text-base sm:text-lg font-black text-gray-900">25-Yr Warranty</div>
              <div className="text-[11px] text-gray-500 font-medium">Tier-1 DCR Solar Panels</div>
            </div>
          </div>
        </div>

        {/* Category Filters and Play/Pause Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-600/20'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-gray-200/80 text-gray-600 hover:text-primary-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer"
              title={isPaused ? 'Resume Auto-Slide' : 'Pause Auto-Slide'}
              aria-label={isPaused ? 'Resume Auto-Slide' : 'Pause Auto-Slide'}
            >
              {isPaused ? <Play size={12} className="fill-current text-emerald-600" /> : <Pause size={12} className="fill-current text-amber-600" />}
              <span>{isPaused ? 'Resume Slide' : 'Auto Sliding (Left ➔ Right)'}</span>
            </button>
          </div>
        </div>

        {/* Local Styles for Left-to-Right Continuous Auto-Slide Marquee */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee-ltr-smooth {
            0% {
              transform: translateX(calc(-50% - 12px));
            }
            100% {
              transform: translateX(0%);
            }
          }
          .reviews-marquee-ltr-track {
            display: flex;
            width: max-content;
            gap: 20px;
            animation: marquee-ltr-smooth 55s linear infinite;
            will-change: transform;
          }
          .reviews-marquee-ltr-track.paused {
            animation-play-state: paused !important;
          }
          .reviews-marquee-ltr-track:hover {
            animation-play-state: paused;
          }
          @media (max-width: 640px) {
            .reviews-marquee-ltr-track {
              animation-duration: 40s;
              gap: 14px;
            }
          }
        `}} />

        {/* Auto-Sliding Left-to-Right Marquee Ticker Container */}
        <div 
          className="relative w-full overflow-hidden py-4 mask-gradient group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle Left and Right Vignette Gradients */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent z-10 pointer-events-none" />

          <div className={`reviews-marquee-ltr-track ${isPaused ? 'paused' : ''}`}>
            {duplicatedList.map((t, idx) => (
              <div 
                key={`${t.id}-${idx}`} 
                className="w-[290px] sm:w-[380px] md:w-[410px] shrink-0 bg-white border border-gray-200/80 p-5 sm:p-6 rounded-3xl shadow-xs hover:shadow-lg hover:border-primary-200 transition-all duration-300 flex flex-col justify-between whitespace-normal text-left group/card relative overflow-hidden"
              >
                {/* Accent top gradient bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-accent-500 to-amber-500 opacity-0 group-hover/card:opacity-100 transition-opacity" />

                <div>
                  {/* Top Badges: Stars & System Type */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: t.stars }).map((_, i) => (
                        <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 border border-primary-100 text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0">
                      <Zap size={11} className="text-primary-600" />
                      <span>{t.systemType}</span>
                    </span>
                  </div>

                  {/* Impact Highlights Bar */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                      <CheckCircle2 size={11} className="text-emerald-600" />
                      <span>{t.billImpact}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-accent-50 text-accent-800 border border-accent-200/80 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      <span>{t.subsidy}</span>
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-5">
                    "{t.text}"
                  </p>
                </div>

                {/* Author Info & Verified District Tag */}
                <div className="flex items-center justify-between gap-3 mt-auto border-t border-gray-100 pt-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}>
                      {t.avatar}
                    </div>
                    <div className="leading-tight">
                      <h4 className="text-sm font-bold text-gray-900 group-hover/card:text-primary-700 transition-colors flex items-center gap-1">
                        <span>{t.name}</span>
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium mt-0.5">
                        <MapPin size={10} className="text-gray-400 shrink-0" />
                        <span>{t.location}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100 shrink-0">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-10 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-primary-700/50 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-accent-500/20 text-accent-300 text-xs font-bold px-3 py-1 rounded-full border border-accent-500/30">
              <Sparkles size={12} />
              PM Surya Ghar Muft Bijli Yojana Approved
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Ready to reduce your electricity bill to ₹0?
            </h3>
            <p className="text-xs sm:text-sm text-primary-200">
              Get a free rooftop solar feasibility report, CAD layout, and ₹78,000 direct subsidy assistance in Andhra Pradesh.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="#contact"
              className="bg-accent-500 hover:bg-accent-600 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg hover:shadow-accent-500/30 transition-all transform hover:-translate-y-0.5"
            >
              Get Free Solar Quote & Subsidy Calculation
            </a>
            <a
              href="#store"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full transition-all"
            >
              Explore Store Accessories
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
