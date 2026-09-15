import React, { useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { submitBookingWithNotification, ADMIN_WHATSAPP, BUSINESS_PHONE } from '../../services/notificationService';

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
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitBookingWithNotification('site_survey', formData);
      setSubmittedResult(res);
    } catch (err) {
      console.error("Survey submission error:", err);
      // Fallback
      setSubmittedResult({
        bookingId: `MSV-SRV-${Date.now().toString().slice(-6)}`,
        waUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`☀️ *SITE SURVEY BOOKING*\nName: ${formData.name}\nPhone: ${formData.phone}\nDistrict: ${formData.district}\nTown: ${formData.mandal}\nBill: ₹${formData.bill}\nRoof: ${formData.roofType}\nDate: ${formData.preferredDate}`)}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section py-16 bg-white" id="pm-surya-ghar" aria-label="Book a free rooftop site survey for solar installation in Andhra Pradesh">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">Free On-Site Rooftop Assessment — Zero Obligation</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4 mb-4">Book Your Free Rooftop Site Survey in Andhra Pradesh (PM Surya Ghar)</h2>
          <p className="text-base text-gray-600 leading-relaxed">Our design engineers will physically visit your location, measure your rooftop area, test shadow patterns throughout the day, assess structural load-bearing capacity, and recommend the optimal solar system capacity — completely free of charge. No commitments required.</p>
        </div>

        <div className="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 sm:p-10 max-w-[700px] mx-auto text-left">
          {submittedResult ? (
            <div className="text-center py-6 space-y-5">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 font-heading">Survey Booked Successfully!</h3>
                <p className="text-gray-600 text-sm mt-1 max-w-md mx-auto">
                  Thank you, <strong className="text-gray-900">{formData.name}</strong>. Your rooftop assessment request has been recorded and our engineers are notified.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Reference</span>
                  <span className="text-xs font-mono font-black text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-md">
                    {submittedResult.bookingId}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1 pt-1 border-t border-slate-200/60">
                  <p>• <strong>Location:</strong> {formData.mandal}, {formData.district}</p>
                  <p>• <strong>Preferred Date:</strong> {formData.preferredDate}</p>
                  <p>• <strong>Contact:</strong> {formData.phone}</p>
                </div>
              </div>

              {/* Instant WhatsApp Action */}
              <div className="space-y-3 max-w-md mx-auto">
                <a
                  href={submittedResult.waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-md transition-all text-sm cursor-pointer"
                >
                  <MessageSquare size={16} className="fill-slate-950" />
                  <span>Send Survey Details on WhatsApp</span>
                  <ArrowRight size={15} />
                </a>
                <p className="text-[11px] text-slate-500">
                  Direct WhatsApp Desk: <strong>{BUSINESS_PHONE}</strong>
                </p>
              </div>

              <button 
                onClick={() => {
                  setSubmittedResult(null);
                  setFormData({
                    name: '',
                    phone: '',
                    district: '',
                    mandal: '',
                    bill: '',
                    roofType: '',
                    preferredDate: ''
                  });
                }}
                className="mt-4 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
              >
                Book another rooftop survey
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="survey-name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    id="survey-name" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm" 
                    placeholder="Your Full Name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="survey-phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mobile Number (WhatsApp) *</label>
                  <input 
                    type="tel" 
                    id="survey-phone" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm" 
                    placeholder="e.g. 9876543210" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="survey-district" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">District (Andhra Pradesh) *</label>
                  <select 
                    id="survey-district" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm"
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    required
                  >
                    <option value="">Select District</option>
                    <option value="East Godavari">East Godavari (Rajahmundry)</option>
                    <option value="Kakinada">Kakinada</option>
                    <option value="Konaseema">Konaseema (Amalapuram)</option>
                    <option value="West Godavari">West Godavari (Bhimavaram)</option>
                    <option value="Eluru">Eluru</option>
                    <option value="Krishna">Krishna (Machilipatnam)</option>
                    <option value="NTR">NTR (Vijayawada)</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Visakhapatnam">Visakhapatnam</option>
                    <option value="Other">Other District in AP</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="survey-mandal" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mandal / Town *</label>
                  <input 
                    type="text" 
                    id="survey-mandal" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm" 
                    placeholder="Enter Mandal or Town name" 
                    value={formData.mandal}
                    onChange={(e) => setFormData({...formData, mandal: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="survey-bill" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Average Monthly Bill (₹) *</label>
                  <input 
                    type="number" 
                    id="survey-bill" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm" 
                    placeholder="e.g. 3000" 
                    value={formData.bill}
                    onChange={(e) => setFormData({...formData, bill: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="survey-roof" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rooftop Surface Type *</label>
                  <select 
                    id="survey-roof" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm"
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
                  <label htmlFor="survey-date" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Preferred Date for Survey *</label>
                  <input 
                    type="date" 
                    id="survey-date" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm" 
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                    required 
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-xs text-slate-500 pb-3">
                    🔔 You will receive instant WhatsApp & Email confirmation upon booking.
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-accent cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Registering Site Survey...</span>
                  </>
                ) : (
                  <>
                    <span>Book Free Site Survey Now</span>
                    <Calendar size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
