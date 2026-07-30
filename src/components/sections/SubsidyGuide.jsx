import React, { useState } from 'react';
import { Home, Sun, Zap, Calculator } from 'lucide-react';

export default function SubsidyGuide() {
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
      icon: <Sun size={24} />,
      title: "2 kW Rooftop Solar System",
      desc: "Designed for standard 2BHK households running basic cooling loads, a refrigerator, a washing machine, and standard kitchen appliances on single-phase supply.",
      subsidy: "₹60,000 Direct Subsidy",
      subNote: "₹30,000/kW for the first 2kW of installed capacity"
    },
    {
      icon: <Zap size={24} />,
      title: "3 kW Rooftop Solar System",
      desc: "Recommended for modern households running multiple air conditioners, water heaters, EV chargers, and high-consumption appliances.",
      subsidy: "₹78,000 Direct Subsidy",
      subNote: "₹30,000/kW for first 2kW + ₹18,000 for next 1kW"
    },
    {
      icon: <Home size={24} />,
      title: "4 kW & Above Systems",
      desc: "Ideal for large residential buildings, joint family villas, and commercial properties with substantial cooling and machinery loads.",
      subsidy: "₹78,000 Maximum Subsidy",
      subNote: "Government subsidy capped at maximum of ₹78,000"
    }
  ];

  return (
    <section className="section py-16 bg-gray-50 border-y border-gray-100" id="subsidy-guide" aria-label="PM Surya Ghar Muft Bijli Yojana subsidy guide for Andhra Pradesh">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">Central Government Solar Subsidy — Active in AP</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">PM Surya Ghar Muft Bijli Yojana — Get Up to ₹78,000 Government Subsidy</h2>
          <p className="text-base text-gray-600 leading-relaxed">The PM Surya Ghar Muft Bijli Yojana is a central government scheme that provides direct financial assistance to Indian homeowners who install rooftop solar systems. Mirror Solar Vision is a registered installer under this scheme and handles the entire application, documentation, and disbursement process for you at no extra cost.</p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-6 mb-16 snap-x snap-mandatory scrollbar-none select-none">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="w-[290px] shrink-0 snap-center md:w-auto bg-white p-6 rounded-2xl border border-gray-100 shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow"
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
        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8 max-w-[800px] mx-auto text-left">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
            <div className="bg-accent-500 text-white w-10 h-10 rounded-xl flex items-center justify-center">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">PM Surya Ghar Subsidy & Savings Calculator</h3>
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
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shrink-0 w-full sm:w-auto"
            >
              Calculate Savings
            </button>
          </form>

          {calcResult && (
            <div className="bg-gray-50 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in-up">
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
