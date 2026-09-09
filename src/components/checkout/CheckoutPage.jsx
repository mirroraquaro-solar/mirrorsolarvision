import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CheckoutPage = ({ onPaymentSuccess, onBack, checkoutData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser: user, userProfile } = useAuth();

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
    state: ''
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
            address: address
          },
          amount: totalAmount,
          items: cartItems,
          userId: effectiveUserId,
          address: address
        })
      });

      const responseData = await res.json();
      const data = responseData.data || responseData;
      
      if (!data || !data.id) {
        throw new Error(data?.error || 'Failed to create order on backend.');
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: 'rzp_live_TKPn1OrUr9ScII',
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
                  userId: effectiveUserId
                },
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                firestoreOrderId: data.firestoreOrderId,
                userId: effectiveUserId
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
          email: user?.email || '',
          contact: address.phone
        },
        theme: {
          color: '#0A2540'
        }
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please check your internet connection.");
      }

      const rzp1 = new window.Razorpay(options);
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
      <header className="bg-[#0A192F] text-white border-b border-slate-800 py-3.5 px-4 sm:px-6 sticky top-0 z-30 shadow-md">
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
                    <img src={item.image} alt="" className="max-h-full max-w-full object-contain" />
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
                  <form onSubmit={handleAddressSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name (First and Last Name) *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Ramesh Kumar"
                        value={address.fullName} 
                        onChange={e => setAddress({...address, fullName: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mobile Number (10 Digits) *
                        </label>
                        <input 
                          type="tel" 
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
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address (Optional, for Courier/Invoice)
                        </label>
                        <input 
                          type="email" 
                          value={address.email} 
                          onChange={e => setAddress({...address, email: e.target.value})} 
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                          placeholder="e.g. name@example.com" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        PIN Code * (Auto City/State)
                      </label>
                      <input 
                        type="text" 
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Flat, House No., Building, Apartment *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Door / House No, Building Name"
                        value={address.flat} 
                        onChange={e => setAddress({...address, flat: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Area, Street, Sector, Village *
                      </label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Street Name, Landmark, Area"
                        value={address.area} 
                        onChange={e => setAddress({...address, area: e.target.value})} 
                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Town / City *
                        </label>
                        <input 
                          type="text" 
                          required 
                          placeholder="City / District"
                          value={address.city} 
                          onChange={e => setAddress({...address, city: e.target.value})} 
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm sm:text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition" 
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          State *
                        </label>
                        <input 
                          type="text" 
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
                        checked 
                        readOnly 
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 cursor-pointer" 
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
