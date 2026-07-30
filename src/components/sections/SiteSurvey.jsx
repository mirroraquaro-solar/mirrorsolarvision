import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function SiteSurvey() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: '',
    mandal: '',
    bill: '',
    roofType: '',
    preferredDate: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="section py-16 bg-white" id="pm-surya-ghar" aria-label="Book a free rooftop site survey for solar installation in Andhra Pradesh">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">Free On-Site Rooftop Assessment — Zero Obligation</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Book Your Free Rooftop Site Survey in Andhra Pradesh (PM Surya Ghar)</h2>
          <p className="text-base text-gray-600 leading-relaxed">Our design engineers will physically visit your location, measure your rooftop area, test shadow patterns throughout the day, assess structural load-bearing capacity, and recommend the optimal solar system capacity — completely free of charge. No commitments required.</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-8 max-w-[700px] mx-auto text-left">
          {submitted ? (
            <div className="text-center py-8">
              <span className="text-5xl block mb-4">🎉</span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Survey Booked Successfully!</h3>
              <p className="text-gray-500 text-sm">Our design engineers will call you shortly to confirm the preferred date and schedule. Thank you!</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-bold text-primary-500 hover:underline"
              >
                Book another survey
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="survey-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                  <input 
                    type="text" 
                    id="survey-name" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    placeholder="Your Full Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="survey-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mobile Number</label>
                  <input 
                    type="tel" 
                    id="survey-phone" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    placeholder="e.g. 9876543210" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="survey-district" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">District (Andhra Pradesh)</label>
                  <select 
                    id="survey-district" 
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
                    <option value="Other">Other District</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="survey-mandal" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mandal / Town</label>
                  <input 
                    type="text" 
                    id="survey-mandal" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    placeholder="Enter Mandal or Town name" 
                    value={formData.mandal}
                    onChange={(e) => setFormData({...formData, mandal: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="survey-bill" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Average Monthly Bill (₹)</label>
                  <input 
                    type="number" 
                    id="survey-bill" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    placeholder="e.g. 3000" 
                    value={formData.bill}
                    onChange={(e) => setFormData({...formData, bill: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="survey-roof" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rooftop Surface Type</label>
                  <select 
                    id="survey-roof" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    value={formData.roofType}
                    onChange={(e) => setFormData({...formData, roofType: e.target.value})}
                    required
                  >
                    <option value="">Select Surface Type</option>
                    <option value="Concrete Open Roof">Flat Concrete (Standard Open Roof)</option>
                    <option value="Asbestos Sheet">Asbestos / ACC Sheets</option>
                    <option value="Metal Sheet Roof">Metal Truss / Tin Roof</option>
                    <option value="Tiled Sloped Roof">Traditional Sloped Tiled Roof</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="survey-date" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Preferred Date for Survey</label>
                  <input 
                    type="date" 
                    id="survey-date" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20" 
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    required 
                  />
                </div>
                <div></div>
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-accent"
              >
                Book Site Survey Now <Calendar size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
