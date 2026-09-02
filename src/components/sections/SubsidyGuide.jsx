import React, { useState } from 'react';
import { Home, Sun, Zap, Calculator, ChevronLeft, ChevronRight } from 'lucide-react';

export default function SubsidyGuide() {
  const [activeCardTab, setActiveCardTab] = useState(0);
  const [monthlyBill, setMonthlyBill] = useState('');
  const [calcResult, setCalcResult] = useState(null);

  const calculateSubsidy = (e) => {
    e.preventDefault();
    const bill = parseFloat(monthlyBill);
    if (isNaN(bill) || bill <= 0) return;

    let size = 2;
    let cost = 145000;
    let subsidy = 60000;

    if (bill >= 1500 && bill < 3000) {
      size = 3;
      cost = 210000;
      subsidy = 78000;
    } else if (bill >= 3000) {
      size = 4;
      cost = 270000;
      subsidy = 78000;
    }

    const netCost = cost - subsidy;
    const monthlySavings = Math.round(bill * 0.9);
    const paybackYears = (netCost / (monthlySavings * 12)).toFixed(1);

    setCalcResult({
      size,
      cost,
      subsidy,
      netCost,
      monthlySavings,
      paybackYears
    });
  };

  const cards = [
    {
      tabLabel: "2 kW System",
      icon: <Sun size={24} />,
      title: "2 kW Rooftop Solar System",
      desc: "Designed for standard 2BHK households running basic cooling loads, a refrigerator, a washing machine, and standard kitchen appliances on single-phase supply.",
      subsidy: "₹60,000 Direct Subsidy",
      subNote: "₹30,000/kW for the first 2kW of installed capacity"
    },
    {
      tabLabel: "3 kW System",
      icon: <Zap size={24} />,
      title: "3 kW Rooftop Solar System",
      desc: "Recommended for modern households running multiple air conditioners, water heaters, EV chargers, and high-consumption appliances.",
      subsidy: "₹78,000 Direct Subsidy",
      subNote: "₹30,000/kW for first 2kW + ₹18,000 for next 1kW"
    },
    {
      tabLabel: "4 kW & Above",
      icon: <Home size={24} />,
      title: "4 kW & Above Systems",
      desc: "Ideal for large residential buildings, joint family villas, and commercial properties with substantial cooling and machinery loads.",
      subsidy: "₹78,000 Maximum Subsidy",
      subNote: "Government subsidy capped at maximum of ₹78,000"
    }
  ];

  return (
    <section className="section py-16 bg-gray-50 border-y border-gray-100 scroll-mt-20" id="subsidy-guide" aria-label="PM Surya Ghar Muft Bijli Yojana subsidy guide for Andhra Pradesh">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center max-w-[800px] mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">
            Central Government Solar Subsidy — Active in AP
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-3">
            PM Surya Ghar Muft Bijli Yojana — Get Up to ₹78,000 Government Subsidy
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            The PM Surya Ghar Muft Bijli Yojana is a central government scheme that provides direct financial assistance to Indian homeowners who install rooftop solar systems. Mirror Solar Vision is a registered installer under this scheme and handles the entire application, documentation, and disbursement process for you at no extra cost.
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MOBILE VIEW: Small Title Tabs & Full Matter Card with Dots */}
        {/* ------------------------------------------------------------- */}
        <div className="block md:hidden mb-12 space-y-4">
          
          {/* Quick Select Tabs */}
          <div className="grid grid-cols-3 gap-1.5">
            {cards.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveCardTab(i)}
                className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold transition-all text-center cursor-pointer truncate ${
                  activeCardTab === i
                    ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {c.tabLabel}
              </button>
            ))}
          </div>

          {/* Active Card with Full Matter */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md flex flex-col justify-between text-left">
            <div>
              <div className="bg-primary-50 text-primary-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                {cards[activeCardTab].icon}
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                {cards[activeCardTab].title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
                {cards[activeCardTab].desc}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-1">
              <span className="text-primary-600 text-xl font-black block">
                {cards[activeCardTab].subsidy}
              </span>
              <p className="text-xs text-gray-500 leading-normal">
                {cards[activeCardTab].subNote}
              </p>
            </div>

            {/* Dots Navigation */}
            <div className="flex items-center justify-between pt-5 mt-4 border-t border-gray-100">
              <button
                onClick={() => setActiveCardTab(prev => (prev - 1 + cards.length) % cards.length)}
                aria-label="Previous Capacity"
                className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex items-center gap-1.5">
                {cards.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setActiveCardTab(dotIdx)}
                    aria-label={`Go to system ${dotIdx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      activeCardTab === dotIdx 
                        ? 'w-6 h-2 bg-primary-600' 
                        : 'w-2 h-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveCardTab(prev => (prev + 1) % cards.length)}
                aria-label="Next Capacity"
                className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 text-gray-700 flex items-center justify-center shadow-xs cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* DESKTOP VIEW: Clean 3-Column Grid */}
        {/* ------------------------------------------------------------- */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-16">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-300 text-left"
            >
              <div>
                <div className="bg-primary-50 text-primary-500 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-6">{card.desc}</p>
              </div>
              <div>
                <span className="text-primary-500 text-xl font-extrabold block">{card.subsidy}</span>
                <p className="text-[10px] text-gray-400 mt-1 leading-normal">{card.subNote}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subsidy Calculator Sub-section */}
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 sm:p-8 max-w-[800px] mx-auto text-left">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="bg-accent-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">PM Surya Ghar Subsidy & Savings Calculator</h3>
              <p className="text-xs text-gray-500">Estimate your required system capacity, subsidy, and net project cost instantly.</p>
            </div>
          </div>

          <form onSubmit={calculateSubsidy} className="flex flex-col sm:flex-row items-end gap-4 mb-6">
            <div className="flex-1 w-full">
              <label htmlFor="monthly-bill-input" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Your Average Monthly Electricity Bill (₹)</label>
              <input 
                type="number" 
                id="monthly-bill-input" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                placeholder="e.g. 3000" 
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                required 
              />
            </div>
            <button 
              type="submit" 
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shrink-0 w-full sm:w-auto cursor-pointer"
            >
              Calculate Savings
            </button>
          </form>

          {calcResult && (
            <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up">
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Recommended Capacity</span>
                <strong className="text-gray-900 text-lg font-black block mt-1">{calcResult.size} kW</strong>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Estimated Project Cost</span>
                <strong className="text-gray-900 text-lg font-black block mt-1">₹{calcResult.cost.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Government Subsidy</span>
                <strong className="text-green-600 text-lg font-black block mt-1">₹{calcResult.subsidy.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Your Net Cost (approx)</span>
                <strong className="text-primary-500 text-lg font-black block mt-1">₹{calcResult.netCost.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Estimated Monthly Savings</span>
                <strong className="text-accent-500 text-lg font-black block mt-1">₹{calcResult.monthlySavings.toLocaleString('en-IN')}</strong>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Est. Payback Period</span>
                <strong className="text-gray-900 text-lg font-black block mt-1">{calcResult.paybackYears} Years</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
