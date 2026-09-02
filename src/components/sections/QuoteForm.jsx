import React, { useState } from 'react';
import { Calculator, Phone } from 'lucide-react';

export default function QuoteForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: '',
    propertyType: 'residential',
    monthlyBill: '',
    inquiryType: 'solar-plant',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const apDistricts = [
    'East Godavari (Rajahmundry)',
    'Kakinada',
    'Dr. B.R. Ambedkar Konaseema (Amalapuram)',
    'West Godavari (Bhimavaram)',
    'Eluru',
    'Krishna (Machilipatnam)',
    'NTR (Vijayawada)',
    'Guntur',
    'Bapatla',
    'Palnadu',
    'Prakasam (Ongole)',
    'Visakhapatnam',
    'Anakapalli',
    'Vizianagaram',
    'Srikakulam',
    'Parvathipuram Manyam',
    'Alluri Sitharama Raju',
    'Sri Potti Sriramulu Nellore',
    'Tirupati',
    'Chittoor',
    'Annamayya',
    'YSR (Kadapa)',
    'Nandyal',
    'Kurnool',
    'Ananthapuramu',
    'Sri Sathya Sai'
  ];

  return (
    <section className="section py-16 lg:py-20 bg-slate-50 border-t border-slate-200/80 scroll-mt-20" id="contact" aria-label="Get a free solar quote and custom rooftop layout">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-accent-600 bg-accent-500/10 px-3.5 py-1.5 rounded-full border border-accent-500/20">
            Free Custom Solar Design & Cost Estimate
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 font-heading tracking-tight">
            Get Your Free Solar Quote & Custom Layout
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Submit your details below and our engineering team will prepare a custom structural plan, optimal panel layout, estimated daily generation, and transparent cost breakdown for your rooftop — delivered within 24 hours.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 shadow-xl rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto text-left">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                ✓
              </div>
              <h3 className="text-2xl font-black text-slate-950 font-heading">
                Quote Request Submitted Successfully!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you, <strong className="text-slate-900">{formData.name}</strong>. Our engineering team has received your rooftop details and will connect with your layout and cost estimate within 24 hours.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-extrabold text-primary-600 hover:underline uppercase tracking-wider block mx-auto"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="lead-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name *</label>
                  <input 
                    type="text" 
                    id="lead-name" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm" 
                    placeholder="Enter your full name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                {/* Phone */}
                <div>
                  <label htmlFor="lead-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      id="lead-phone" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 pr-10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm" 
                      placeholder="e.g. 9876543210" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required 
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label htmlFor="lead-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    id="lead-email" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm" 
                    placeholder="name@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {/* AP District */}
                <div>
                  <label htmlFor="lead-district" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">District in AP / State *</label>
                  <select 
                    id="lead-district" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    required
                  >
                    <option value="">Select District</option>
                    {apDistricts.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Property Type */}
                <div>
                  <label htmlFor="lead-property" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Property Type</label>
                  <select 
                    id="lead-property" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    required
                  >
                    <option value="residential">Residential Home</option>
                    <option value="commercial">Commercial Building</option>
                    <option value="industrial">Industrial / Warehouse</option>
                    <option value="agricultural">Agricultural Solar Pump</option>
                  </select>
                </div>
                {/* Monthly Bill */}
                <div>
                  <label htmlFor="lead-bill" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Avg. Monthly Electricity Bill (₹)</label>
                  <input 
                    type="number" 
                    id="lead-bill" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm" 
                    placeholder="e.g. 3500" 
                    value={formData.monthlyBill}
                    onChange={(e) => setFormData({...formData, monthlyBill: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Inquire details */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">I want to inquire about:</label>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="inquiryType" 
                      value="solar-plant" 
                      className="text-primary-600 focus:ring-primary-500" 
                      checked={formData.inquiryType === 'solar-plant'}
                      onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                    />
                    <span>Rooftop Solar Plant Setup</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="inquiryType" 
                      value="bulk-combo" 
                      className="text-primary-600 focus:ring-primary-500" 
                      checked={formData.inquiryType === 'bulk-combo'}
                      onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                    />
                    <span>₹15,000 Bulk Installation Combo</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="inquiryType" 
                      value="commercial-solar" 
                      className="text-primary-600 focus:ring-primary-500" 
                      checked={formData.inquiryType === 'commercial-solar'}
                      onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                    />
                    <span>Commercial & Industrial Solar</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="lead-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Message / Roof Specifications (Optional)</label>
                <textarea 
                  id="lead-message" 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 h-24 text-sm resize-none" 
                  placeholder="e.g., Roof area is 1200 sq ft, open concrete rooftop. Need details on net metering and subsidy."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-4 rounded-xl transition-all shadow-accent text-sm cursor-pointer"
              >
                Request Free Rooftop Calculation <Calculator size={17} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
