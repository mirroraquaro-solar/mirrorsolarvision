import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, AlertCircle, ShoppingBag, MapPin, Navigation, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loadRazorpay } from '../../services/razorpayLoader';
import { analytics } from '../../aqua/services/analytics';
import { detectCurrentLocation } from '../../services/notificationService';

const CheckoutPage = ({ onPaymentSuccess, onBack, checkoutData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser: user, userProfile } = useAuth();
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const cartItems = checkoutData?.items 
    ? checkoutData.items 
    : checkoutData?.item 
      ? [{ ...checkoutData.item, price: checkoutData.totalPrice / (checkoutData.item.quantity || 1) }]
      : [];
  const totalAmount = checkoutData ? checkoutData.totalPrice : 0;

  // Address State
  const [address, setAddress] = useState({
    fullName: userProfile?.fullName || user?.displayName || '',
    email: user?.email || '',
    phone: userProfile?.phone || '',
    pincode: '',
    flat: '',
    area: '',
    city: '',
    state: '',
    googleMapsLink: '',
    latitude: null,
    longitude: null
  });
  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment

  if (!checkoutData || cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
        <p className="text-xl text-gray-700 mb-4 font-bold">No active order found</p>
        <button 
          onClick={onBack} 
          className="bg-[#FFD814] hover:bg-[#F7CA00] text-sm font-bold py-3 px-6 rounded-xl shadow-sm border border-[#FCD200] cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      analytics.trackBeginCheckout(cartItems, totalAmount, address);
    } catch (err) {}
  };

  const handleAutoLocate = async () => {
    setIsLocating(true);
    setLocationError(null);
    setLocationSuccess(null);

    try {
      const loc = await detectCurrentLocation();
      setAddress(prev => ({
        ...prev,
        pincode: loc.pincode || prev.pincode,
        flat: loc.flat ? (prev.flat ? `${prev.flat}, ${loc.flat}` : loc.flat) : prev.flat,
        area: loc.area || prev.area,
        city: loc.city || prev.city,
        state: loc.state || prev.state,
        googleMapsLink: loc.googleMapsLink,
        latitude: loc.latitude,
        longitude: loc.longitude
      }));

      // If pincode was fetched, run postal API if city or state is missing
      if (loc.pincode && (!loc.city || !loc.state)) {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${loc.pincode}`);
          const pData = await res.json();
          if (pData && pData[0].Status === 'Success') {
            const po = pData[0].PostOffice[0];
            setAddress(prev => ({
              ...prev,
              city: prev.city || po.District || po.Region || '',
              state: prev.state || po.State || ''
            }));
          }
        } catch (e) {}
      }

      setLocationSuccess(`GPS Location Detected (${loc.latitude}°, ${loc.longitude}°). Address auto-filled.`);
    } catch (err) {
      setLocationError(err.message || 'Could not fetch GPS location.');
    } finally {
      setIsLocating(false);
    }
  };

  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAddress(prev => ({ ...prev, pincode: val }));
    
    if (val.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setAddress(prev => ({
            ...prev,
            pincode: val,
            city: postOffice.District || postOffice.Region || '',
            state: postOffice.State || ''
          }));
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err);
      }
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const effectiveUserId = user?.uid || `guest_${address.phone ? address.phone.replace(/[^0-9]/g, '') : Date.now()}`;
      const fbp = analytics.getFbp();
      const fbc = analytics.getFbc();
      
      // 1. Call Backend to create Razorpay Order & Save Address
      const createOrderURL = 'https://us-central1-mirror-solar-vision.cloudfunctions.net/createRazorpayOrder';
      
      const res = await fetch(createOrderURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            amount: totalAmount,
            items: cartItems,
            userId: effectiveUserId,
            address: address,
            fbp,
            fbc
          },
          amount: totalAmount,
          items: cartItems,
          userId: effectiveUserId,
          address: address,
          fbp,
          fbc
        })
      });

      const responseData = await res.json();
      const data = responseData.data || responseData;
      
      if (!data || !data.id) {
        throw new Error(data?.error || 'Failed to create order on backend.');
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Tfvc73Xs6tShFL',
        amount: data.amount, 
        currency: data.currency,
        name: 'Mirror Solar Vision',
        description: 'Solar Equipment Purchase',
        image: '/assets/images/logo/msv_logo_500x300.png',
        order_id: data.id,
        handler: async function (response) {
          // 3. Verify Payment and Trigger Shiprocket Order on Backend
          try {
            const verifyURL = 'https://us-central1-mirror-solar-vision.cloudfunctions.net/verifyRazorpayPayment';
            const verifyRes = await fetch(verifyURL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                data: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  firestoreOrderId: data.firestoreOrderId,
                  userId: effectiveUserId,
                  fbp,
                  fbc,
                  eventSourceUrl: window.location.href
                },
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                firestoreOrderId: data.firestoreOrderId,
                userId: effectiveUserId,
                fbp,
                fbc,
                eventSourceUrl: window.location.href
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.data && verifyData.data.success) {
              const shipmentId = verifyData.data.shiprocketShipmentId || null;
              
              // Persist locally for immediate access & guest order tracking
              try {
                const existing = JSON.parse(localStorage.getItem('msv_recent_orders') || '[]');
                const bookingId = data.bookingId || data.firestoreOrderId || `MSV-${Date.now().toString().slice(-6)}`;
                const newOrderRecord = {
                  id: data.firestoreOrderId,
                  bookingId: bookingId,
                  userId: effectiveUserId,
                  shiprocketShipmentId: shipmentId,
                  amount: totalAmount,
                  items: cartItems,
                  address: address,
                  status: 'paid',
                  createdAt: { seconds: Math.floor(Date.now() / 1000) }
                };
                const updatedList = [newOrderRecord, ...existing.filter(o => o.id !== data.firestoreOrderId)].slice(0, 30);
                localStorage.setItem('msv_recent_orders', JSON.stringify(updatedList));
              } catch (localErr) {
                console.warn("Could not save recent order to localStorage:", localErr);
              }

              // Track Purchase event in Meta Pixel with matching eventID (purchase_MSV-XXXXXX)
              try {
                analytics.trackPurchase({
                  orderId: data.bookingId || data.firestoreOrderId,
                  bookingId: data.bookingId || data.firestoreOrderId,
                  id: data.firestoreOrderId,
                  total: totalAmount,
                  amount: totalAmount,
                  items: cartItems,
                  customer: address,
                  shippingAddress: address
                });
              } catch (trackErr) {
                console.warn("Analytics purchase tracking:", trackErr);
              }

              onPaymentSuccess({
                 orderId: data.firestoreOrderId,
                 bookingId: data.bookingId || data.firestoreOrderId,
                 shiprocketShipmentId: shipmentId,
                 amount: totalAmount,
                 items: cartItems,
                 address: address,
                 razorpayPaymentId: response.razorpay_payment_id
              });
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
             setError("Error verifying payment.");
             console.error(err);
          }
        },
        prefill: {
          name: address.fullName,
          email: address.email || user?.email || '',
          contact: address.phone
        },
        theme: {
          color: '#0A2540'
        }
      };

      const RazorpayInstance = await loadRazorpay();
      if (!RazorpayInstance) {
        throw new Error("Razorpay SDK could not be loaded. Please check your internet connection.");
      }

      const rzp1 = new RazorpayInstance(options);
      rzp1.on('payment.failed', function (response){
        setError(`Payment Failed: ${response.error.description}`);
      });
      rzp1.open();

    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-16 text-slate-900">
      
      {/* Checkout Header (Fully Mobile Responsive) */}
      <header className="bg-[#0A192F] text-white border-b border-slate-800 py-3.5 px-4 sm:px-6 sticky top-[72px] sm:top-[78px] z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Back to Store</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1"></div>
            <div className="flex items-center gap-1.5 font-heading font-black text-base sm:text-lg">
              <span>Mirror Solar</span>
              <span className="text-[#F58220]">Checkout</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            <Lock size={12} />
            <span className="hidden sm:inline">256-Bit SSL Secure</span>
            <span className="sm:hidden">Secure</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        
        {/* Order Items Bar (Mobile & Desktop) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 mb-4 shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary-600" />
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Order Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
              </span>
            </div>
            <span className="text-xs font-black text-slate-900">
              Total: ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {cartItems.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                    <img src={item.image} alt={item.name || 'Cart item'} width="40" height="40" loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.variantLabel} • Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
          
          {/* Left Column: Multi-Step Form */}
          <div className="w-full lg:flex-1 space-y-4">
            
            {/* Step 1: Delivery Address */}
            <div className={`bg-white rounded-2xl border transition-all ${step === 1 ? 'border-primary-500 shadow-sm' : 'border-slate-200'}`}>
              <div className="p-4 flex justify-between items-center bg-slate-50 rounded-t-2xl border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 1 ? 'bg-primary-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {step > 1 ? '✓' : '1'}
                  </span>
                  <h2 className={`text-base sm:text-lg font-bold ${step === 1 ? 'text-primary-700' : 'text-slate-900'}`}>
                    Delivery Address
                  </h2>
                </div>
                {step > 1 && (
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-primary-600 hover:text-primary-800 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {step === 1 && (
                <div className="p-4 sm:p-6">
                  {/* Google Maps / GPS Auto-Fill Card */}
                  <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50/90 to-sky-50/90 rounded-2xl border border-blue-200/80 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5 sm:mt-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                            <span>Use Exact Location (Google Maps / GPS)</span>
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">1-Tap Fill</span>
                          </h4>
                          <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-snug">
                            Auto-detects PIN code, street, town & attaches exact map pin for fast delivery.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAutoLocate}
                        disabled={isLocating}
                        className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                      >
                        {isLocating ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Detecting GPS...</span>
                          </>
                        ) : (
                          <>
                            <Navigation size={14} />
                            <span>Detect My Location</span>
                          </>
                        )}
                      </button>
                    </div>

                    {locationSuccess && (
                      <div className="mt-2.5 pt-2.5 border-t border-blue-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50/80 px-2.5 py-1.5 rounded-lg">
                        <span className="flex items-center gap-1">
                          <Check size={13} className="text-emerald-600" />
                          <span>{locationSuccess}</span>
                        </span>
                        {address.googleMapsLink && (
                          <a
                            href={address.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 font-bold underline inline-flex items-center gap-0.5"
                          >
                            <span>View Google Maps Pin</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    )}

                    {locationError && (
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/80 flex items-center gap-1">
                        <AlertCircle size={13} className="text-amber-600 shrink-0" />
                        <span>{locationError}</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAddressSubmit} className="space-y-3.5">
                    <div>
                      <label htmlFor="checkout-name" className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name (First and Last Name) *
                      </label>
                      <input 
                        type="text" 
                        id="checkout-name"
                        name="fullName"
                        autoComplete="name"
                        required 
                        placeholder="e.g. Ramesh Kumar"
                        value={address.fullName} 
                        onChange={e => setAddress({...address, fullName: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="checkout-phone" className="block text-xs font-bold text-slate-700 mb-1">
                          Mobile Number (10 Digits) *
                        </label>
                        <input 
                          type="tel" 
                          id="checkout-phone"
                          name="phone"
                          autoComplete="tel"
                          required 
                          pattern="[0-9]{10}" 
                          maxLength="10" 
                          value={address.phone} 
                          onChange={e => setAddress({...address, phone: e.target.value.replace(/[^0-9]/g, '')})} 
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                          placeholder="10-digit mobile number" 
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-email" className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address (Optional, for Courier/Invoice)
                        </label>
                        <input 
                          type="email" 
                          id="checkout-email"
                          name="email"
                          autoComplete="email"
                          value={address.email} 
                          onChange={e => setAddress({...address, email: e.target.value})} 
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                          placeholder="e.g. name@example.com" 
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="checkout-pincode" className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code * (Auto City/State)
                      </label>
                      <input 
                        type="text" 
                        id="checkout-pincode"
                        name="pincode"
                        autoComplete="postal-code"
                        required 
                        pattern="[0-9]{6}" 
                        maxLength="6" 
                        value={address.pincode} 
                        onChange={handlePincodeChange} 
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition placeholder-slate-400 font-mono" 
                        placeholder="6-digit PIN code" 
                      />
                    </div>

                    <div>
                      <label htmlFor="checkout-flat" className="block text-xs font-bold text-slate-700 mb-1">
                        Flat, House No., Building, Apartment *
                      </label>
                      <input 
                        type="text" 
                        id="checkout-flat"
                        name="flat"
                        autoComplete="address-line1"
                        required 
                        placeholder="Door / House No, Building Name"
                        value={address.flat} 
                        onChange={e => setAddress({...address, flat: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                      />
                    </div>

                    <div>
                      <label htmlFor="checkout-area" className="block text-xs font-bold text-slate-700 mb-1">
                        Area, Street, Sector, Village *
                      </label>
                      <input 
                        type="text" 
                        id="checkout-area"
                        name="area"
                        autoComplete="address-line2"
                        required 
                        placeholder="Street Name, Landmark, Area"
                        value={address.area} 
                        onChange={e => setAddress({...address, area: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label htmlFor="checkout-city" className="block text-xs font-bold text-slate-700 mb-1">
                          Town / City *
                        </label>
                        <input 
                          type="text" 
                          id="checkout-city"
                          name="city"
                          autoComplete="address-level2"
                          required 
                          placeholder="City / District"
                          value={address.city} 
                          onChange={e => setAddress({...address, city: e.target.value})} 
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                        />
                      </div>

                      <div>
                        <label htmlFor="checkout-state" className="block text-xs font-bold text-slate-700 mb-1">
                          State *
                        </label>
                        <input 
                          type="text" 
                          id="checkout-state"
                          name="state"
                          autoComplete="address-level1"
                          required 
                          placeholder="State"
                          value={address.state} 
                          onChange={e => setAddress({...address, state: e.target.value})} 
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        className="w-full sm:w-auto bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-bold py-3 px-8 rounded-xl shadow-sm border border-[#FCD200] transition cursor-pointer text-sm"
                      >
                        Proceed to Payment Method
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {step > 1 && (
                <div className="p-4 text-xs sm:text-sm text-slate-700 bg-white rounded-b-2xl">
                  <p className="font-bold text-slate-900">{address.fullName} ({address.phone})</p>
                  <p className="text-slate-600 mt-0.5">{address.flat}, {address.area}</p>
                  <p className="text-slate-600">{address.city}, {address.state} - <span className="font-mono font-bold">{address.pincode}</span></p>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`bg-white rounded-2xl border transition-all ${step === 2 ? 'border-primary-500 shadow-sm' : 'border-slate-200'}`}>
              <div className="p-4 flex justify-between items-center bg-slate-50 rounded-t-2xl border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${step === 2 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    2
                  </span>
                  <h2 className={`text-base sm:text-lg font-bold ${step === 2 ? 'text-primary-700' : 'text-slate-900'}`}>
                    Select Payment Method
                  </h2>
                </div>
              </div>
              
              {step === 2 && (
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
                    
                    {/* Active Option: Razorpay UPI & QR */}
                    <div className="p-4 bg-amber-50/70 flex items-start gap-3">
                      <input 
                        type="radio" 
                        id="payment-method-upi"
                        name="paymentMethod"
                        checked 
                        readOnly 
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 cursor-pointer" 
                        aria-label="Pay with UPI and QR code"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-slate-900">
                            Scan & Pay with UPI / QR Code
                          </span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            Instant Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Pay with any UPI App (Google Pay, PhonePe, Paytm, BHIM, CRED) or scan dynamic QR code.
                        </p>
                      </div>
                    </div>

                    {/* Disabled Info */}
                    <div className="p-3.5 bg-slate-50 flex items-center justify-between opacity-60 text-xs text-slate-500">
                      <span>Cash on Delivery (COD)</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">Prepaid Only</span>
                    </div>

                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button 
                      onClick={handlePayment} 
                      disabled={loading}
                      className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-md border border-[#FCD200] transition cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                      <Lock size={16} />
                      <span>{loading ? 'Opening Payment Gateway...' : `PAY ₹${totalAmount.toLocaleString('en-IN')} NOW`}</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-500 mt-2">
                      🔒 Powered by Razorpay & Shiprocket • 100% Buyer Protection
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary Card */}
          <div className="w-full lg:w-80">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 sticky top-20 shadow-xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                Order Summary
              </h3>
              
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 border-b border-slate-100 pb-3">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Shipping:</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
              </div>
              
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-sm text-slate-900">Order Total:</span>
                <span className="font-black text-xl text-slate-950">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {step === 2 && (
                <button 
                  onClick={handlePayment} 
                  disabled={loading}
                  className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-black py-3 rounded-xl shadow-sm border border-[#FCD200] transition cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-1.5"
                >
                  <Lock size={14} />
                  <span>{loading ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}</span>
                </button>
              )}

              <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 space-y-1 border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Check size={12} className="text-emerald-600" />
                  <span>Doorstep Delivery across AP</span>
                </div>
                <p>Tracking number and invoice sent immediately via SMS after payment.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
