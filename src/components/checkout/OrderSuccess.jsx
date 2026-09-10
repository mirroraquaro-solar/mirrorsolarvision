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
  Send 
} from 'lucide-react';
// import { BUSINESS_CONTACT } from '../../data/bulkComboData';
import { db } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const OrderSuccess = ({ orderData, onContinueShopping, onViewOrders }) => {
  const orderId = orderData?.orderId || (typeof orderData === 'string' ? orderData : orderData?.id || 'N/A');
  const shipmentId = orderData?.shiprocketShipmentId;
  const amount = orderData?.amount || 0;
  const items = orderData?.items || [];
  const address = orderData?.address || {};
  const paymentId = orderData?.razorpayPaymentId || orderData?.paymentId || '';

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
📞 *Mirror Solar Support:* +91 86391 03947
🏢 *Address:* Opposite Vmax Cinema Hall, Eluru, AP
🌐 *Website:* https://mirrorsolarvision.com`;

  const businessWhatsAppUrl = `https://wa.me/918639103947?text=${encodeURIComponent(
    `*NEW ORDER BOOKING CONFIRMATION*\n\n${whatsappReceipt}`
  )}`;

  const customerShareWhatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `*My Mirror Solar Vision Order Invoice:*\n\n${whatsappReceipt}`
  )}`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 mb-6 shadow-sm ring-8 ring-emerald-50">
          <CheckCircle className="h-10 w-10" />
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-heading">
          Payment Successful!
        </h2>
        <p className="text-slate-600 text-sm sm:text-base mb-6">
          Thank you for ordering with Mirror Solar Vision. Your order is confirmed and shipping is being prepared.
        </p>

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

          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900">
              <MessageSquare size={16} className="text-emerald-600 shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">WhatsApp Bill & Confirmation</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Get an instant official digital invoice with full product breakdown sent directly via WhatsApp.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={businessWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-xs transition-all text-center"
              >
                <MessageSquare size={13} />
                <span>Notify Our Office</span>
              </a>
              <a
                href={customerShareWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs py-2.5 px-3 rounded-xl transition-all text-center"
              >
                <Share2 size={13} className="text-emerald-600" />
                <span>Save / Share Bill</span>
              </a>
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