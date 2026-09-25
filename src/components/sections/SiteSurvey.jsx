import React, { useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Loader2, Printer, Copy, FileText, Check } from 'lucide-react';
import { submitBookingWithNotification, ADMIN_WHATSAPP, printConfirmationDocument, getCustomerWhatsAppUrl } from '../../services/notificationService';

export default function SiteSurvey() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    district: '',
    mandal: '',
    bill: '',
    roofType: '',
    preferredDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copiedNote, setCopiedNote] = useState(false);

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
        waUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`☀️ *SITE SURVEY BOOKING*\nName: ${formData.name}\nPhone: ${formData.phone}\n${formData.email ? `Email: ${formData.email}\n` : ''}District: ${formData.district}\nTown: ${formData.mandal}\nBill: ₹${formData.bill}\nRoof: ${formData.roofType}\nDate: ${formData.preferredDate}`)}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section py-16 bg-white scroll-mt-24 sm:scroll-mt-28" id="pm-surya-ghar" aria-label="Book a free rooftop site survey for solar installation in Andhra Pradesh">
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
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Booking Reference</span>
                  <span className="text-xs font-mono font-black text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-md">
                    {submittedResult.bookingId}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1 pt-1 border-t border-slate-200/60">
                  <p>• <strong>Location:</strong> {formData.mandal}, {formData.district}</p>
                  <p>• <strong>Preferred Date:</strong> {formData.preferredDate}</p>
                  <p>• <strong>Contact:</strong> +91 {formData.phone}</p>
                  {formData.email && <p>• <strong>Email:</strong> {formData.email}</p>}
                </div>
              </div>

              {/* Official Confirmation Note Actions */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 text-left space-y-3 shadow-sm border border-slate-800 max-w-md mx-auto">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <FileText size={15} className="text-[#F58220]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Official Booking Note</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      printConfirmationDocument({
                        title: 'FREE ROOFTOP SITE SURVEY BOOKING CONFIRMATION',
                        bookingId: submittedResult.bookingId,
                        customerName: formData.name,
                        customerPhone: formData.phone,
                        customerEmail: formData.email,
                        address: `${formData.mandal}, ${formData.district} (Andhra Pradesh)`,
                        items: [{
                          name: 'PM Surya Ghar Free Rooftop Site Survey & Feasibility Report',
                          variantLabel: `Roof Type: ${formData.roofType || 'Standard'} • Preferred Date: ${formData.preferredDate || 'Earliest'}`,
                          quantity: 1,
                          price: 0
                        }],
                        totalAmount: 0,
                        paymentStatus: 'Free On-Site Assessment Confirmed (Zero Obligation)',
                        notes: `Monthly Electricity Bill: ${formData.bill || 'Not specified'}`,
                        type: 'site_survey'
                      });
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0A2540] hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer text-center"
                  >
                    <Printer size={13} className="text-[#F58220]" />
                    <span>Print / Save Slip (PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const receipt = `☀️ *MIRROR SOLAR VISION — FREE SITE SURVEY BOOKING*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Booking Reference:* ${submittedResult.bookingId}\n👤 *Customer:* ${formData.name} (+91 ${formData.phone})\n📍 *Location:* ${formData.mandal}, ${formData.district}\n📅 *Preferred Date:* ${formData.preferredDate}\n⚡ *Assessment:* Free PM Surya Ghar Rooftop Inspection\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📞 Support: +91 91826 12420`;
                      try {
                        await navigator.clipboard.writeText(receipt);
                        setCopiedNote(true);
                        setTimeout(() => setCopiedNote(false), 3000);
                      } catch {}
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer text-center"
                  >
                    {copiedNote ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="text-slate-300" />
                        <span>Copy Booking Note</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Customer WhatsApp Action */}
                <div className="pt-1">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Opens WhatsApp with your pre-filled survey note — tap Send to save to your chat:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={getCustomerWhatsAppUrl(formData.phone, `☀️ *MIRROR SOLAR VISION — FREE SITE SURVEY BOOKING*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Booking Reference:* ${submittedResult.bookingId}\n👤 *Customer:* ${formData.name}\n📍 *Location:* ${formData.mandal}, ${formData.district}\n📅 *Preferred Date:* ${formData.preferredDate}\n⚡ *Assessment:* Free PM Surya Ghar Rooftop Feasibility Survey\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📞 Support: +91 91826 12420`)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs py-2 px-3 rounded-xl shadow-xs transition text-center cursor-pointer"
                    >
                      <MessageSquare size={13} className="fill-slate-950" />
                      <span>Send to My WhatsApp</span>
                    </a>

                    <a
                      href={submittedResult.waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 px-3 rounded-xl transition text-center cursor-pointer"
                    >
                      <span>Notify Survey Desk</span>
                    </a>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSubmittedResult(null);
                  setFormData({
                    name: '',
                    phone: '',
                    email: '',
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <label htmlFor="survey-email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address (Optional)</label>
                  <input 
                    type="email" 
                    id="survey-email" 
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm" 
                    placeholder="e.g. name@example.com" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">For confirmation note & schedule</p>
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
