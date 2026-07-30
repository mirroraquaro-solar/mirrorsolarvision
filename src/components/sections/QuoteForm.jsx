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

  return (
    <section className="section py-16 bg-gray-50 border-t border-gray-100" id="contact" aria-label="Get a free solar quote and custom rooftop layout">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">Free Custom Solar Design & Cost Estimate</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Get Your Free Solar Quote & Custom Rooftop Layout</h2>
          <p className="text-base text-gray-600 leading-relaxed">Submit your details below and our engineering team will prepare a custom structural plan, optimal panel layout, estimated daily generation, and transparent cost breakdown for your rooftop — delivered within 24 hours. No hidden charges. No obligation.</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8 max-w-[700px] mx-auto text-left">
          {submitted ? (
            <div className="text-center py-8">
              <span className="text-5xl block mb-4">🎉</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Quote Request Submitted!</h3>
              <p className="text-gray-500 text-sm">Our engineering team has received your details and will email/WhatsApp you the custom layout and cost estimate within 24 hours. Thank you!</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-bold text-primary-500 hover:underline"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="lead-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="lead-name" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    placeholder="Enter your full name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                {/* Phone */}
                <div>
                  <label htmlFor="lead-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      id="lead-phone" 
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 pr-10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                      placeholder="e.g. 9876543210" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required 
                    />
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label htmlFor="lead-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    id="lead-email" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    placeholder="name@email.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {/* AP District */}
                <div>
                  <label htmlFor="lead-district" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">District in Andhra Pradesh</label>
                  <select 
                    id="lead-district" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    required
                  >
                    <option value="">Select District</option>
                    <option value="East Godavari">East Godavari (Rajahmundry)</option>
                    <option value="Kakinada">Kakinada</option>
                    <option value="Konaseema">Konaseema (Amalapuram)</option>
                    <option value="West Godavari">West Godavari</option>
                    <option value="Krishna">Krishna</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Eluru">Eluru</option>
                    <option value="Other">Other District</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Type */}
                <div>
                  <label htmlFor="lead-property" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Property Type</label>
                  <select 
                    id="lead-property" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                    required
                  >
                    <option value="residential">Residential Home</option>
                    <option value="commercial">Commercial Building</option>
                    <option value="industrial">Industrial/Warehouse</option>
                    <option value="agricultural">Agricultural Pump</option>
                  </select>
                </div>
                {/* Monthly Bill */}
                <div>
                  <label htmlFor="lead-bill" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Average Monthly Electricity Bill (₹)</label>
                  <input 
                    type="number" 
                    id="lead-bill" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    placeholder="e.g. 3500" 
                    value={formData.monthlyBill}
                    onChange={(e) => setFormData({...formData, monthlyBill: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Inquire details */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">I want to inquire about:</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-semibold">
                    <input 
                      type="radio" 
                      name="inquiryType" 
                      value="solar-plant" 
                      className="form-radio text-primary-500 focus:ring-primary-500" 
                      checked={formData.inquiryType === 'solar-plant'}
                      onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                    />
                    <span>Rooftop Solar Plant Setup</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 font-semibold">
                    <input 
                      type="radio" 
                      name="inquiryType" 
                      value="drain-clips" 
                      className="form-radio text-primary-500 focus:ring-primary-500" 
                      checked={formData.inquiryType === 'drain-clips'}
                      onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                    />
                    <span>Solar Dust & Water Drain Clips</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="lead-message" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Message / Roof Specifications (Optional)</label>
                <textarea 
                  id="lead-message" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 h-28" 
                  placeholder="e.g., Roof area is 1200 sq ft, open concrete rooftop. Need details of Growatt inverters."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-accent"
              >
                Request Free Calculation <Calculator size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
