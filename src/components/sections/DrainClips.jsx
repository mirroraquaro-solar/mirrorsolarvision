import React, { useState } from 'react';
import { ShoppingCart, ShieldCheck, RefreshCw, Truck, X, Plus, Minus, MessageSquare, Loader2, Printer, Copy, FileText, Check } from 'lucide-react';
import { submitBookingWithNotification, ADMIN_WHATSAPP, printConfirmationDocument, getCustomerWhatsAppUrl } from '../../services/notificationService';

export default function DrainClips() {
  const images = [
    '/assets/images/001.png',
    '/assets/images/002.png',
    '/assets/images/003.png',
    '/assets/images/004.png',
    '/assets/images/005.png',
    '/assets/images/006.png'
  ];

  const [activeImage, setActiveImage] = useState(images[0]);
  const [selectedSize, setSelectedSize] = useState('35mm');
  const [selectedPack, setSelectedPack] = useState(50); // 10, 50, 100
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [copiedNote, setCopiedNote] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    district: '',
    mandal: ''
  });

  // Price configuration
  const prices = {
    10: 499,
    50: 1999,
    100: 3499
  };

  const currentPrice = prices[selectedPack];
  const totalPrice = currentPrice * quantity;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setOrderSubmitting(true);
    const totalClips = selectedPack * quantity;
    const kwEquivalent = (totalClips / 4);
    const items = [{
      name: 'MSV Heavy-Duty Drain Clips',
      selectedSize,
      size: selectedSize,
      kw: kwEquivalent,
      clipsCount: totalClips,
      quantity,
      price: currentPrice,
      variantLabel: `${selectedSize} • ${totalClips} Clips (${kwEquivalent} kW)`
    }];

    try {
      const res = await submitBookingWithNotification('drain_clips', {
        ...checkoutForm,
        selectedSize,
        size: selectedSize,
        selectedPack,
        quantity,
        totalUnits: totalClips,
        kw: `${kwEquivalent} kW`,
        totalPrice,
        amount: totalPrice,
        items,
        productName: `MSV Heavy-Duty Drain Clips (${selectedSize}, ${totalClips} units / ${kwEquivalent} kW)`
      });
      setSubmittedResult(res);
      setOrderSubmitted(true);
    } catch (err) {
      console.error("Drain clips booking error:", err);
      setSubmittedResult({
        bookingId: `MSV-DRN-${Date.now().toString().slice(-6)}`,
        waUrl: `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(`📦 *DRAIN CLIPS ORDER*\nName: ${checkoutForm.name}\nPhone: ${checkoutForm.phone}\n${checkoutForm.email ? `Email: ${checkoutForm.email}\n` : ''}Item: MSV Drain Clips\nFrame Size: ${selectedSize}\nPlant Capacity: ${kwEquivalent} kW\nTotal Clips: ${totalClips} Units\nTotal: ₹${totalPrice}\nAddress: ${checkoutForm.address}, ${checkoutForm.mandal}, ${checkoutForm.district}`)}`
      });
      setOrderSubmitted(true);
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <section className="section py-16 bg-white border-y border-gray-100 scroll-mt-20" id="drain-clips" aria-label="Solar panel dust and water drain clips product feature">
      <div className="container-custom">
        <div className="text-center max-w-[800px] mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">India's First Solar Panel Maintenance Accessory</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-4">Solar Panel Dust & Water Drain Clips</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-[1100px] mx-auto">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex items-center justify-center aspect-square overflow-hidden shadow-sm">
              <img 
                src={activeImage} 
                alt="Solar panel drain clip product" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            {/* Thumbnail Strip */}
            <div className="grid grid-cols-6 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`border-[2px] rounded-xl overflow-hidden aspect-square flex items-center justify-center p-1 bg-white hover:border-accent-500 transition-all ${activeImage === img ? 'border-accent-500' : 'border-gray-200'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Buying Details (6 cols) */}
          <div className="lg:col-span-6 text-left space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-accent-500/10 text-accent-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">Anti-Soiling Technology</span>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">MSV Heavy-Duty Drain Clips</h3>
              <p className="text-sm text-gray-500 mt-2">Boost solar panel output by up to 15% by eliminating stagnant water and dirty mud bands along the bottom frame.</p>
            </div>

            {/* Price section */}
            <div className="border-y border-gray-100 py-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-950">₹{totalPrice.toLocaleString('en-IN')}</span>
              <span className="text-sm text-gray-400">for {selectedPack * quantity} units</span>
            </div>

            {/* Frame Thickness Selector */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Select Frame Thickness:</span>
              <div className="flex gap-3">
                {['30mm', '35mm', '40mm'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2.5 rounded-xl border-[2px] text-sm font-bold transition-all ${selectedSize === size ? 'border-primary-500 text-primary-500 bg-primary-50/50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Pack Size Selector */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Select Pack Quantity:</span>
              <div className="flex gap-3">
                {[10, 50, 100].map((pack) => (
                  <button
                    key={pack}
                    onClick={() => setSelectedPack(pack)}
                    className={`px-5 py-3 rounded-xl border-[2px] text-sm font-bold flex flex-col items-center justify-center flex-1 transition-all ${selectedPack === pack ? 'border-primary-500 text-primary-500 bg-primary-50/50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                  >
                    <span className="text-base">{pack} Clips</span>
                    <span className="text-[11px] font-medium text-gray-400 mt-0.5">₹{prices[pack]} / pack</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 pt-6">
              <div className="flex items-center border-[2px] border-gray-200 rounded-xl bg-white h-14">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-4 text-gray-500 hover:text-gray-900 transition-colors h-full flex items-center justify-center"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 text-base font-bold text-gray-900 w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="px-4 text-gray-500 hover:text-gray-900 transition-colors h-full flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full sm:flex-1 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-accent transition-all duration-300"
              >
                <ShoppingCart size={18} /> Buy Now
              </button>
            </div>

            {/* Shipping Specs */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-[11px] text-gray-500 font-semibold">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-accent-500" />
                <span>Free Shipping in AP</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-accent-500" />
                <span>UV-Stabilized Poly</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-accent-500" />
                <span>Easy Snap-on fit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional E-commerce Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden relative animate-fade-in-up">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-accent-500" />
                <span className="font-heading font-bold text-base">Checkout Order Details</span>
              </div>
              <button 
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderSubmitted(false);
                }} 
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {orderSubmitted ? (
              <div className="p-6 sm:p-8 text-center space-y-4 max-h-[85vh] overflow-y-auto">
                <span className="text-4xl sm:text-5xl block">🎉</span>
                <h4 className="text-xl font-bold text-gray-900 font-heading">Order Placed Successfully!</h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Thank you, <strong>{checkoutForm.name}</strong>. Your order for <strong>MSV Heavy-Duty Drain Clips</strong> has been recorded and registered with our dispatch team.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left text-xs text-gray-700 space-y-2">
                  {submittedResult?.bookingId && (
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">Booking Reference</span>
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">{submittedResult.bookingId}</span>
                    </div>
                  )}
                  <p><strong>Item:</strong> MSV Heavy-Duty Drain Clips ({selectedSize})</p>
                  <p><strong>Capacity / Clips:</strong> {selectedPack * quantity / 4} kW ({selectedPack * quantity} Clips)</p>
                  <p><strong>Total Amount:</strong> <span className="font-black text-emerald-700">₹{totalPrice.toLocaleString('en-IN')}</span></p>
                  <p><strong>Delivery Location:</strong> {checkoutForm.address}, {checkoutForm.mandal}, {checkoutForm.district}</p>
                  {checkoutForm.email && <p><strong>Confirmation Email:</strong> {checkoutForm.email}</p>}
                </div>

                {/* Official Confirmation Note Actions */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 text-left space-y-3 shadow-sm border border-slate-800">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
                    <FileText size={15} className="text-[#F58220]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Official Confirmation Note</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        printConfirmationDocument({
                          title: 'OFFICIAL DRAIN CLIPS ORDER SLIP',
                          bookingId: submittedResult?.bookingId || 'MSV-DRN',
                          customerName: checkoutForm.name,
                          customerPhone: checkoutForm.phone,
                          customerEmail: checkoutForm.email,
                          address: `${checkoutForm.address}, ${checkoutForm.mandal}, ${checkoutForm.district}`,
                          items: [{
                            name: 'MSV Heavy-Duty Drain Clips',
                            selectedSize,
                            size: selectedSize,
                            kw: `${selectedPack * quantity / 4} kW`,
                            clipsCount: `${selectedPack * quantity} Clips`,
                            quantity,
                            price: currentPrice
                          }],
                          totalAmount: totalPrice,
                          paymentStatus: 'Order Confirmed (Cash on Delivery / UPI on Dispatch)',
                          type: 'drain_clips'
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
                        const receipt = `🧾 *MIRROR SOLAR VISION — DRAIN CLIPS ORDER INVOICE*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ *Status:* Order Placed & Confirmed\n📦 *Booking ID:* ${submittedResult?.bookingId || 'MSV-DRN'}\n👤 *Customer:* ${checkoutForm.name} (+91 ${checkoutForm.phone})\n📍 *Address:* ${checkoutForm.address}, ${checkoutForm.mandal}, ${checkoutForm.district}\n🛒 *Item:* MSV Drain Clips (${selectedSize}) - ${selectedPack * quantity} Clips\n💰 *Total Amount:* ₹${totalPrice.toLocaleString('en-IN')}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📞 Support: +91 91826 12420`;
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
                          <span>Copy Confirmation Note</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* WhatsApp Customer Link */}
                  <div className="pt-1">
                    <p className="text-[11px] text-slate-400 mb-2">
                      Opens WhatsApp with your pre-filled confirmation note — tap Send to save to your chat:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href={getCustomerWhatsAppUrl(checkoutForm.phone, `🧾 *MIRROR SOLAR VISION — DRAIN CLIPS ORDER INVOICE*\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ *Status:* Order Placed & Confirmed\n📦 *Booking ID:* ${submittedResult?.bookingId || 'MSV-DRN'}\n👤 *Customer:* ${checkoutForm.name}\n📍 *Address:* ${checkoutForm.address}, ${checkoutForm.mandal}, ${checkoutForm.district}\n🛒 *Item:* MSV Drain Clips (${selectedSize}) - ${selectedPack * quantity} Clips (${selectedPack * quantity / 4} kW)\n💰 *Total:* ₹${totalPrice.toLocaleString('en-IN')}\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n📞 Support: +91 91826 12420`)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs py-2 px-3 rounded-xl shadow-xs transition text-center cursor-pointer"
                      >
                        <MessageSquare size={13} className="fill-slate-950" />
                        <span>Send to My WhatsApp</span>
                      </a>

                      <a
                        href={submittedResult?.waUrl || `https://wa.me/${ADMIN_WHATSAPP}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2 px-3 rounded-xl transition text-center cursor-pointer"
                      >
                        <span>Notify Dispatch Desk</span>
                      </a>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setOrderSubmitted(false);
                    setSubmittedResult(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-colors mt-2 text-xs cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-3.5 text-left">
                {/* Product Summary Mini Card */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-gray-800">MSV Heavy-Duty Drain Clips ({selectedSize})</p>
                    <p className="text-gray-400 mt-0.5">{selectedPack * quantity} units ({selectedPack * quantity / 4} kW)</p>
                  </div>
                  <strong className="text-primary-500 font-extrabold text-sm">₹{totalPrice.toLocaleString('en-IN')}</strong>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    placeholder="Enter your name"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required 
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                      placeholder="e.g. 9876543210"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address (Optional)</label>
                    <input 
                      type="email" 
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                      placeholder="e.g. name@example.com"
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">For confirmation note & invoice delivery</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">District (AP) *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                      placeholder="e.g. East Godavari"
                      value={checkoutForm.district}
                      onChange={(e) => setCheckoutForm({...checkoutForm, district: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mandal / Town *</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                      placeholder="e.g. Rajahmundry"
                      value={checkoutForm.mandal}
                      onChange={(e) => setCheckoutForm({...checkoutForm, mandal: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Delivery Address *</label>
                  <textarea 
                    required 
                    rows="2"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                    placeholder="Complete delivery address"
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={orderSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-3.5 rounded-xl transition-all shadow-accent text-sm mt-4 disabled:opacity-50 cursor-pointer"
                >
                  {orderSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Placing Order & Dispatching Notification...</span>
                    </>
                  ) : (
                    <span>Place Order (Cash on Delivery / UPI)</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
