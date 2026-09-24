import React, { useState } from 'react';
import { Calculator, Phone, MessageSquare, CheckCircle, Loader2, Mail, Printer, Copy, FileText, Check } from 'lucide-react';
import { submitBookingWithNotification, ADMIN_WHATSAPP, printConfirmationDocument, getCustomerWhatsAppUrl } from '../../services/notificationService';

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
  const [submitting, setSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copiedNote, setCopiedNote] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submitBookingWithNotification('quote_request', formData);
      setSubmittedResult(res);
    } catch (err) {
      console.error("Quote submission error:", err);
      setSubmittedResult({
        bookingId: `MSV-QTE-${Date.now().toString().slice(-6)}`,
        waUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`⚡ *FREE SOLAR QUOTE REQUEST*\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nDistrict: ${formData.district}\nType: ${formData.propertyType}\nBill: ₹${formData.monthlyBill}\nInquiry: ${formData.inquiryType}\nNote: ${formData.message}`)}`
      });
    } finally {
      setSubmitting(false);
    }
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
          {submittedResult ? (
            <div className="text-center py-6 space-y-5">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-950 font-heading">
                  Quote Request Received!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Thank you, <strong className="text-slate-900">{formData.name}</strong>. Your requirement has been registered and dispatched to our engineering desk via WhatsApp and Email.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-[10px]">Quote Reference</span>
                  <span className="text-xs font-mono font-black text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-md">
                    {submittedResult.bookingId}
                  </span>
                </div>
                <div className="text-xs text-slate-700 space-y-1 pt-1 border-t border-slate-200/60">
                  <p>• <strong>District:</strong> {formData.district}</p>
                  <p>• <strong>Monthly Bill:</strong> ₹{formData.monthlyBill}</p>
                  <p>• <strong>Property Type:</strong> {formData.propertyType}</p>
                  {formData.email && <p>• <strong>Email:</strong> {formData.email}</p>}
                </div>
              </div>

              {/* Official Confirmation Note Actions */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 text-left space-y-3 shadow-sm border border-slate-800 max-w-md mx-auto">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                  <FileText size={15} className="text-[#F58220]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Official Quote Request Note</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      printConfirmationDocument({
                        title: 'FREE SOLAR QUOTE & DESIGN REQUEST CONFIRMATION',
                        bookingId: submittedResult.bookingId,
                        customerName: formData.name,
                        customerPhone: formData.phone,
                        customerEmail: formData.email,
                        address: `${formData.district} (Andhra Pradesh)`,
                        items: [{
                          name: `Solar Quotation & System Sizing (${formData.inquiryType || 'PM Surya Ghar'})`,
                          variantLabel: `Property: ${formData.propertyType} • Monthly Bill: ₹${formData.monthlyBill || 'N/A'}`,
                          quantity: 1,
                          price: 0
                        }],
                        totalAmount: 0,
                        paymentStatus: 'Quote Request Registered (Design in Progress)',
                        notes: formData.message,
                        type: 'quote_request'
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
                      const receipt = `⚡ *MIRROR SOLAR VISION — FREE SOLAR QUOTE REQUEST*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Quote Reference:* ${submittedResult.bookingId}\n👤 *Customer:* ${formData.name} (+91 ${formData.phone})\n📍 *District:* ${formData.district}\n📊 *Property:* ${formData.propertyType} | Bill: ₹${formData.monthlyBill}\n⚡ *Inquiry:* ${formData.inquiryType}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📞 Support: +91 91826 12420`;
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
                        <span>Copy Quote Note</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Customer WhatsApp Action */}
                <div className="pt-1">
                  <p className="text-[11px] text-slate-400 mb-2">
                    Opens WhatsApp with your pre-filled quote note — tap Send to save to your chat:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={getCustomerWhatsAppUrl(formData.phone, `⚡ *MIRROR SOLAR VISION — FREE SOLAR QUOTE REQUEST*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📋 *Quote Reference:* ${submittedResult.bookingId}\n👤 *Customer:* ${formData.name}\n📍 *District:* ${formData.district}\n📊 *Property:* ${formData.propertyType} | Bill: ₹${formData.monthlyBill}\n⚡ *Inquiry:* ${formData.inquiryType}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📞 Support: +91 91826 12420`)}
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
                      <span>Notify Engineering Desk</span>
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
                    propertyType: 'residential',
                    monthlyBill: '',
                    inquiryType: 'solar-plant',
                    message: ''
                  });
                }}
                className="mt-4 text-xs font-extrabold text-primary-600 hover:underline uppercase tracking-wider block mx-auto cursor-pointer"
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
                  <label htmlFor="lead-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Phone Number (WhatsApp) *</label>
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
                  <label htmlFor="lead-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address (For Written Quote)</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      id="lead-email" 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 pr-10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm" 
                      placeholder="name@email.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  </div>
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
                    <option value="">Select your district</option>
                    {apDistricts.map((district, idx) => (
                      <option key={idx} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Property Type */}
                <div>
                  <label htmlFor="lead-property" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Property Type *</label>
                  <select 
                    id="lead-property" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  >
                    <option value="residential">Residential Home / Villa</option>
                    <option value="apartment">Apartment / Gated Community</option>
                    <option value="commercial">Commercial Building / Office</option>
                    <option value="industrial">Industrial / Factory Roof</option>
                    <option value="agricultural">Agricultural / Solar Water Pump</option>
                  </select>
                </div>
                {/* Monthly Electricity Bill */}
                <div>
                  <label htmlFor="lead-bill" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Avg. Monthly Electricity Bill (₹) *</label>
                  <input 
                    type="number" 
                    id="lead-bill" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm" 
                    placeholder="e.g. 4500" 
                    value={formData.monthlyBill}
                    onChange={(e) => setFormData({...formData, monthlyBill: e.target.value})}
                    required 
                  />
                </div>
              </div>

              {/* Inquiry Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Inquiry Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'solar-plant', label: 'Complete Solar Plant', desc: 'Rooftop on-grid/hybrid system' },
                    { id: 'subsidy-help', label: 'PM Surya Ghar Subsidy', desc: 'Subsidy guidance & approval' },
                    { id: 'custom-quote', label: 'Equipment & Clips', desc: 'Drain clips, frames & cables' }
                  ].map((item) => (
                    <label 
                      key={item.id}
                      className={`flex flex-col p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        formData.inquiryType === item.id 
                          ? 'border-primary-600 bg-primary-50/50 text-slate-900 font-bold ring-1 ring-primary-600' 
                          : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="inquiryType" 
                          value={item.id}
                          checked={formData.inquiryType === item.id}
                          onChange={(e) => setFormData({...formData, inquiryType: e.target.value})}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="font-bold text-slate-900">{item.label}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-1 pl-5">{item.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="lead-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Additional Notes / Roof Specs (Optional)</label>
                <textarea 
                  id="lead-message" 
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm resize-none" 
                  placeholder="e.g. 1200 sq ft flat concrete roof in Rajahmundry, looking for 5kW system..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-4 rounded-xl transition-all shadow-accent text-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing & Notifying Engineering Desk...</span>
                  </>
                ) : (
                  <>
                    <Calculator size={18} className="text-slate-950" />
                    <span>Get My Free Solar Quote & Layout</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-[11px] text-slate-500">
                  🔒 We respect your privacy. Details are directly transmitted to Mirror Solar Vision design engineers.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
