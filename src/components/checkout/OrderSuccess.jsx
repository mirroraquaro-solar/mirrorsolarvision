import React, { useState } from 'react';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  ExternalLink, 
  ArrowRight, 
  ShoppingBag, 
  MessageSquare, 
  Share2, 
  Star, 
  Check, 
  Send,
  Mail,
  Printer,
  Copy,
  FileText,
  X,
  Sparkles
} from 'lucide-react';
// import { BUSINESS_CONTACT } from '../../data/bulkComboData';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ADMIN_WHATSAPP, BUSINESS_PHONE, printConfirmationDocument, getCustomerWhatsAppUrl } from '../../services/notificationService';

const OrderSuccess = ({ orderData, onContinueShopping, onViewOrders }) => {
  const orderId = orderData?.orderId || orderData?.bookingId || (typeof orderData === 'string' ? orderData : orderData?.id || 'N/A');
  const shipmentId = orderData?.shiprocketShipmentId;
  const amount = orderData?.amount || 0;
  const items = orderData?.items || [];
  const address = orderData?.address || {};
  const paymentId = orderData?.razorpayPaymentId || orderData?.paymentId || '';
  const [copiedNote, setCopiedNote] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(true);

  const customerName = address.fullName || 'Valued Customer';
  const customerPhone = address.phone || '';
  const customerCity = address.city ? `${address.city}, ${address.state || 'AP'}` : 'Andhra Pradesh';
  const fullAddressText = [address.flat, address.area, address.city, address.state, address.pincode].filter(Boolean).join(', ');

  // Optional Review State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const reviewerName = customerName !== 'Valued Customer' ? customerName : '';
  const reviewerLocation = customerCity;
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('msv_submitted_reviews') || '{}');
      return !!stored[orderId];
    } catch {
      return false;
    }
  });
  const [reviewSkipped, setReviewSkipped] = useState(false);

  const quickPraiseTags = [
    '⚡ Super Fast Delivery',
    '💯 Premium UV Polymer',
    '👍 Easy Snap-on Fit',
    '🛡️ Heavy-Duty Build',
    '💧 Zero Water Stagnation'
  ];

  const handleTagClick = (tag) => {
    if (reviewComment.includes(tag)) return;
    setReviewComment(prev => prev ? `${prev} • ${tag}` : tag);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewSubmitting || reviewSubmitted) return;

    setReviewSubmitting(true);
    const primaryItem = items[0] || {};
    const reviewPayload = {
      orderId,
      bookingId: orderData?.bookingId || orderId,
      productId: primaryItem.productId || primaryItem.id || 'msv-drain-clips',
      productName: primaryItem.name || 'MSV Solar Equipment',
      variantLabel: primaryItem.variantLabel || '',
      rating: Number(rating) || 5,
      title: reviewTitle.trim() || (rating === 5 ? 'Excellent Solar Quality & Fast Service!' : 'Good Product Experience'),
      comment: reviewComment.trim() || 'Verified genuine solar accessory. Easy installation and prompt delivery.',
      name: reviewerName.trim() || (customerName !== 'Valued Customer' ? customerName : 'Verified Buyer'),
      location: reviewerLocation.trim() || customerCity,
      verified: true,
      verifiedBadge: 'Verified Order Buyer',
      date: 'Just now',
      source: 'order_checkout',
      createdAt: new Date().toISOString()
    };

    try {
      if (db) {
        await addDoc(collection(db, 'product_reviews'), {
          ...reviewPayload,
          serverCreatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Firestore save review warning:', err);
    }

    try {
      const stored = JSON.parse(localStorage.getItem('msv_submitted_reviews') || '{}');
      stored[orderId] = reviewPayload;
      localStorage.setItem('msv_submitted_reviews', JSON.stringify(stored));

      const allReviewsList = JSON.parse(localStorage.getItem('msv_custom_reviews_list') || '[]');
      localStorage.setItem('msv_custom_reviews_list', JSON.stringify([reviewPayload, ...allReviewsList]));
    } catch (localErr) {
      console.warn('localStorage review save:', localErr);
    }

    setReviewSubmitting(false);
    setReviewSubmitted(true);
  };

  const itemsListText = items.length > 0
    ? items.map((it, idx) => `  ${idx + 1}. *${it.name}* (Qty: ${it.quantity}${it.variantLabel ? ` - ${it.variantLabel}` : ''}) - ₹${Number(it.price || 0).toLocaleString('en-IN')}`).join('\n')
    : `  • Solar Store Product (Total: ₹${Number(amount).toLocaleString('en-IN')})`;

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const whatsappReceipt = `🧾 *MIRROR SOLAR VISION — ORDER INVOICE*
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Status:* Paid & Confirmed
📦 *Order ID:* ${orderId}
💳 *Razorpay Payment ID:* ${paymentId || 'Verified Online'}
📅 *Date:* ${dateStr}

👤 *Customer Details:*
• *Name:* ${customerName}
• *Phone:* ${customerPhone}
${fullAddressText ? `• *Address:* ${fullAddressText}` : ''}

🛒 *Ordered Items:*
${itemsListText}

💰 *Total Amount Paid:* ₹${Number(amount).toLocaleString('en-IN')} (Prepaid)

${shipmentId ? `🚚 *Shiprocket Tracking ID:* ${shipmentId}\n🔗 *Live Courier Track:* https://shiprocket.co/tracking/${shipmentId}` : '🚚 *Shipment:* Processing for Dispatch'}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 *Mirror Solar Support:* ${BUSINESS_PHONE}
🏢 *Address:* Opposite Vmax Cinema Hall, Eluru, AP
🌐 *Website:* https://mirrorsolarvision.com`;

  const businessWhatsAppUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(
    `*NEW ORDER BOOKING CONFIRMATION*\n\n${whatsappReceipt}`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative">
      
      {/* ========================================================================= */}
      {/* CONFIRM ORDER POPUP MODAL (Pops up immediately after payment) */}
      {/* ========================================================================= */}
      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl border border-slate-100 text-center relative animate-fade-in-up">
            
            {/* Top Close Button */}
            <button
              onClick={() => setShowConfirmPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
              aria-label="Close confirmation popup"
            >
              <X size={18} />
            </button>

            {/* Celebration Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm ring-8 ring-emerald-50">
              <CheckCircle className="h-9 w-9 sm:h-11 sm:w-11" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-emerald-600" />
              <span>Order Confirmed & Payment Verified</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mb-1.5">
              Thank You, {customerName}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
              Your order has been placed successfully and has been routed to our Andhra Pradesh dispatch desk.
            </p>

            {/* Order Brief Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/90 text-left space-y-2.5 mb-5">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500">Order ID:</span>
                <span className="font-mono font-black text-xs sm:text-sm text-slate-900">{orderId}</span>
              </div>

              {amount > 0 && (
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500">Amount Paid:</span>
                  <span className="font-heading font-black text-sm text-emerald-600">
                    ₹{Number(amount).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {items.length > 0 && (
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500">Items Ordered:</span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[200px]">
                    {items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500">Deliver To:</span>
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                  {address.city ? `${address.city}, ${address.state || 'AP'}` : 'Andhra Pradesh'}
                </span>
              </div>
            </div>

            {/* Popup Action Buttons */}
            <div className="space-y-2.5">
              {/* Primary: TRACK ORDER BUTTON */}
              <button
                type="button"
                onClick={() => {
                  setShowConfirmPopup(false);
                  if (onViewOrders) onViewOrders();
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#071A2E] active:scale-[0.99] text-white font-black py-3.5 px-5 rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm cursor-pointer border border-[#0A2540]"
              >
                <Truck size={18} className="text-[#F58220]" />
                <span>Track Order & Live Shipment</span>
                <ArrowRight size={16} className="text-accent-400" />
              </button>

              {/* Secondary: View Detailed Receipt */}
              <button
                type="button"
                onClick={() => setShowConfirmPopup(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                View Detailed Invoice & Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Order Success Content Card */}
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-5 sm:p-10 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-100 text-emerald-600 mb-5 shadow-sm ring-8 ring-emerald-50">
          <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-heading">
          Payment Successful!
        </h2>
        <p className="text-slate-600 text-xs sm:text-base mb-5">
          Thank you for ordering with Mirror Solar Vision. Your order is confirmed and shipping is being prepared.
        </p>

        {/* TOP QUICK ACTION: TRACK ORDER BANNER */}
        <div className="bg-[#0A2540] text-white rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-500/20 text-[#F58220] flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-accent-400">Order Placed & Live Tracking Ready</p>
              <p className="text-[11px] text-slate-200">Track package dispatch, courier transit, and delivery status anytime</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewOrders}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#FFD814] hover:bg-[#F7CA00] active:scale-[0.98] text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer shrink-0 border border-[#FCD200]"
          >
            <Truck size={14} />
            <span>Track Order</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="space-y-4 mb-6 text-left">
          <div className="bg-slate-50 rounded-2xl p-4.5 border border-slate-200 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
              <Package className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order ID / Reference</p>
              <p className="text-slate-900 font-mono font-bold text-sm sm:text-base break-all mt-0.5">{orderId}</p>
              {amount > 0 && (
                <p className="text-xs font-extrabold text-emerald-700 mt-1">
                  Amount Paid: ₹{Number(amount).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          </div>

          {/* Automated Notifications Confirmation Badge */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl p-4 border border-emerald-200/80 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-900">Notifications Dispatched</p>
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <MessageSquare size={13} className="text-emerald-600 shrink-0" />
                <span>WhatsApp receipt generated & reflected to order desk (<strong>{BUSINESS_PHONE}</strong>).</span>
              </div>
              {customerEmail && (
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-teal-600 shrink-0" />
                  <span>Itemized official invoice sent to <strong>{customerEmail}</strong>.</span>
                </div>
              )}
            </div>
          </div>

          {shipmentId ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl p-4.5 border border-blue-200 flex flex-col gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-blue-700 font-extrabold uppercase tracking-wider">Shiprocket Shipment Created</p>
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Live</span>
                  </div>
                  <p className="text-slate-900 text-sm font-bold mt-1">
                    Tracking ID: <span className="font-mono text-blue-900">{shipmentId}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Courier details and live updates are tracked via Shiprocket.
                  </p>
                </div>
              </div>

              <a
                href={`https://shiprocket.co/tracking/${shipmentId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all"
              >
                <span>Track Package on Shiprocket</span>
                <ExternalLink size={14} />
              </a>
            </div>
          ) : (
            <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-amber-900 font-extrabold uppercase tracking-wider">Shipment Label In Progress</p>
                <p className="text-xs text-slate-700 mt-1">
                  Your shipment is being generated in our dispatch system. You can view real-time tracking updates anytime in <strong>My Orders</strong>.
                </p>
              </div>
            </div>
          )}

          {!reviewSkipped && (
            <div className="bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 border border-amber-200/90 rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                    <Star size={16} className="fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 font-heading">
                      Share Your Experience
                    </h4>
                    <p className="text-[11px] text-slate-500">How satisfied are you with this product and ordering experience?</p>
                  </div>
                </div>

                {!reviewSubmitted && (
                  <button
                    type="button"
                    onClick={() => setReviewSkipped(true)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer underline decoration-dotted"
                  >
                    Skip
                  </button>
                )}
              </div>

              {reviewSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-1.5">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white mb-1 shadow-xs">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-emerald-900">
                    Thank you for your review! ⭐⭐⭐⭐⭐
                  </h5>
                  <p className="text-[11px] text-emerald-700">
                    Your verified feedback helps fellow solar installers and homeowners make the right choice.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-xl p-3 border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-700">Your Rating:</span>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star 
                            size={22} 
                            className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                          />
                        </button>
                      ))}
                      <span className="text-xs font-black text-amber-700 ml-1.5">
                        {rating === 5 ? '5.0 (Excellent)' : rating === 4 ? '4.0 (Very Good)' : rating === 3 ? '3.0 (Good)' : `${rating}.0`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {quickPraiseTags.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Title: e.g., Best solar drain clips in Andhra Pradesh"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                    />
                  </div>

                  <div>
                    <textarea
                      rows={2}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Write your review: e.g., Easy to install, eliminated mud build up completely on our 5kW plant..."
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[10px] text-slate-500 italic">
                      Reviews are verified by order reference
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewSkipped(true)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                      >
                        Maybe Later
                      </button>
                      <button
                        type="submit"
                        disabled={reviewSubmitting}
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send size={12} />
                        <span>{reviewSubmitting ? 'Saving...' : 'Submit Review'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Official Confirmation Note & Document Actions */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-md border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#F58220]/20 text-[#F58220]">
                  <FileText size={16} />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-extrabold text-white">Official Confirmation Note</h4>
                  <p className="text-[11px] text-slate-400">Save, print, or receive your official order invoice slip</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  printConfirmationDocument({
                    title: 'OFFICIAL ORDER CONFIRMATION SLIP',
                    bookingId: orderId,
                    customerName,
                    customerPhone,
                    customerEmail: address.email || '',
                    address: fullAddressText,
                    items,
                    totalAmount: amount,
                    paymentStatus: 'Paid & Confirmed (Razorpay Verified)',
                    paymentId,
                    shipmentId,
                    type: 'order'
                  });
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                <Printer size={14} className="text-[#F58220]" />
                <span>Print / Save Slip (PDF)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(whatsappReceipt);
                    setCopiedNote(true);
                    setTimeout(() => setCopiedNote(false), 3000);
                  } catch {
                    // Fallback
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                {copiedNote ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Confirmation Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} className="text-slate-300" />
                    <span>Copy Confirmation Note</span>
                  </>
                )}
              </button>
            </div>

            {/* Customer WhatsApp Direct Link */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 space-y-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-[#25D366]" />
                  <span>Send Confirmation to My WhatsApp</span>
                </span>
                <span className="text-[10px] text-slate-400">Pre-filled Chat</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Opens WhatsApp with your complete itemized confirmation note — tap Send to save to your chat.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <a
                  href={getCustomerWhatsAppUrl(customerPhone, whatsappReceipt)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl transition-all shadow-xs text-center cursor-pointer"
                >
                  <MessageSquare size={13} className="fill-slate-950" />
                  <span>Send to My WhatsApp</span>
                </a>

                <a
                  href={businessWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl transition-all text-center cursor-pointer"
                >
                  <Share2 size={13} />
                  <span>Notify Dispatch Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onViewOrders}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-slate-900 text-white font-bold py-3.5 px-5 rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
          >
            <ShoppingBag size={18} className="text-[#F58220]" />
            <span>View My Orders & Full Tracking</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={onContinueShopping}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-2xl transition-colors text-sm cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;