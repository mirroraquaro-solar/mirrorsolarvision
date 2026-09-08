import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CheckoutPage = ({ onPaymentSuccess, onBack, checkoutData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser: user, requireAuth } = useAuth();

  const cartItems = checkoutData?.items 
    ? checkoutData.items 
    : checkoutData?.item 
      ? [{ ...checkoutData.item, price: checkoutData.totalPrice / (checkoutData.item.quantity || 1) }]
      : [];
  const totalAmount = checkoutData ? checkoutData.totalPrice : 0;

  // Address State
  const [address, setAddress] = useState({
    fullName: user?.displayName || '',
    phone: '',
    pincode: '',
    flat: '',
    area: '',
    city: '',
    state: ''
  });
  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700 mb-4 font-bold">No active order found</p>
        <button onClick={onBack} className="bg-[#FFD814] hover:bg-[#F7CA00] text-sm font-normal py-2 px-6 rounded-lg shadow-sm border border-[#FCD200]">
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
            address: address // Send address to backend for Shiprocket
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

      // 2. Initialize Razorpay Checkout with the backend order_id
      const options = {
        key: 'rzp_live_TKPn1OrUr9ScII',
        amount: data.amount, 
        currency: data.currency,
        name: 'Mirror Solar Vision',
        description: 'Solar Equipment Purchase',
        image: '/assets/images/logo/msv_logo_500x300.png',
        order_id: data.id, // <--- This fixes the QR Code!
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
              onPaymentSuccess({
                 orderId: data.firestoreOrderId,
                 shiprocketShipmentId: verifyData.data.shiprocketShipmentId
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
          color: '#facc15'
        }
      };

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
    <div className="min-h-screen bg-gray-100 font-sans pb-12">
      {/* Amazon-style Checkout Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/assets/images/logo/msv_logo_500x300.png" alt="Logo" className="h-8 object-contain" />
          <h1 className="text-2xl font-normal text-gray-900 hidden sm:block">Checkout</h1>
        </div>
        <div className="text-gray-500 flex items-center gap-1">
          <ShieldCheck size={20} className="text-gray-400" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Content (Left Column) */}
          <div className="flex-1 space-y-4">
            
            {/* Step 1: Delivery Address */}
            <div className={`bg-white rounded-lg border ${step === 1 ? 'border-orange-400' : 'border-gray-300'}`}>
              <div className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg border-b border-gray-200">
                <h2 className={`text-xl font-bold ${step === 1 ? 'text-orange-700' : 'text-gray-900'}`}>
                  1 <span className="ml-2">Delivery address</span>
                </h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                    Change
                  </button>
                )}
              </div>
              
              {step === 1 && (
                <div className="p-6">
                  <form onSubmit={handleAddressSubmit} className="max-w-xl space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Full name (First and Last name)</label>
                      <input type="text" required value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Mobile number (10 digits)</label>
                      <input type="tel" required pattern="[0-9]{10}" maxLength="10" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value.replace(/[^0-9]/g, '')})} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" placeholder="10-digit mobile number" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Pincode</label>
                      <input type="text" required pattern="[0-9]{6}" maxLength="6" value={address.pincode} onChange={handlePincodeChange} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none placeholder-gray-400" placeholder="6 digits [0-9] PIN code" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Flat, House no., Building, Company, Apartment</label>
                      <input type="text" required value={address.flat} onChange={e => setAddress({...address, flat: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1">Area, Street, Sector, Village</label>
                      <input type="text" required value={address.area} onChange={e => setAddress({...address, area: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">Town/City</label>
                        <input type="text" required value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1">State</label>
                        <input type="text" required value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full border border-gray-400 rounded px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none" />
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button type="submit" className="bg-[#FFD814] hover:bg-[#F7CA00] text-sm font-normal py-2 px-4 rounded-lg shadow-sm border border-[#FCD200]">
                        Use this address
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {step > 1 && (
                <div className="p-4 text-sm text-gray-900">
                  <p className="font-bold">{address.fullName}</p>
                  <p>{address.flat}, {address.area}</p>
                  <p>{address.city}, {address.state} {address.pincode}</p>
                  <p>Phone: {address.phone}</p>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`bg-white rounded-lg border ${step === 2 ? 'border-orange-400' : 'border-gray-300'}`}>
              <div className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg border-b border-gray-200">
                <h2 className={`text-xl font-bold ${step === 2 ? 'text-orange-700' : 'text-gray-900'}`}>
                  2 <span className="ml-2">Select a payment method</span>
                </h2>
              </div>
              
              {step === 2 && (
                <div className="p-6">
                  <div className="border border-gray-300 rounded-md overflow-hidden">
                    
                    {/* Disabled Option */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-3 opacity-50 cursor-not-allowed">
                      <input type="radio" disabled className="mt-1" />
                      <div>
                        <span className="font-bold text-gray-900 block">Credit or debit card</span>
                        <div className="flex gap-1 mt-1">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-5 bg-white border px-1" alt="Visa" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-5 bg-white border px-1" alt="MC" />
                        </div>
                      </div>
                    </div>

                    {/* Disabled Option */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-3 opacity-50 cursor-not-allowed">
                      <input type="radio" disabled className="mt-1" />
                      <div>
                        <span className="font-bold text-gray-900 block">Net Banking</span>
                      </div>
                    </div>

                    {/* Active Option: UPI */}
                    <div className="p-4 border-b border-gray-200 bg-orange-50 flex gap-3">
                      <input type="radio" checked readOnly className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">Scan and Pay with</span>
                          <span className="font-black italic text-gray-700">UPI</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                          <span className="text-blue-600 font-bold">ℹ</span>
                          You will need to Scan the QR code on the payment page to complete the payment.
                        </p>
                      </div>
                    </div>
                    
                    {/* Disabled Option */}
                    <div className="p-4 bg-gray-50 flex gap-3 opacity-50 cursor-not-allowed">
                      <input type="radio" disabled className="mt-1" />
                      <div>
                        <span className="font-bold text-gray-900 block">Cash on Delivery/Pay on Delivery</span>
                        <span className="text-sm text-red-600">Currently unavailable for this order.</span>
                      </div>
                    </div>

                  </div>

                  <div className="mt-6">
                    <button 
                      onClick={handlePayment} 
                      disabled={loading}
                      className="bg-[#FFD814] hover:bg-[#F7CA00] text-sm font-normal py-2 px-6 rounded-lg shadow-sm border border-[#FCD200]"
                    >
                      Use this payment method
                    </button>
                    {error && (
                      <p className="text-red-600 text-sm mt-2">{error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Review items and shipping */}
            <div className={`bg-white rounded-lg border border-gray-300`}>
              <div className="p-4 flex justify-between items-center bg-gray-50 rounded-t-lg border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  3 <span className="ml-2">Review items and shipping</span>
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-500">Please select a payment method above to review your order.</p>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (Amazon style) */}
          <div className="lg:w-[300px]">
            <div className="bg-white border border-gray-300 rounded-lg p-4 sticky top-4">
              <button 
                onClick={handlePayment} 
                disabled={step !== 2 || loading}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-500 text-sm font-normal py-2 rounded-lg shadow-sm border border-[#FCD200] mb-4"
              >
                {loading ? 'Processing...' : 'Use this payment method'}
              </button>
              
              <p className="text-xs text-center text-gray-500 mb-4 border-b border-gray-200 pb-4">
                Choose a payment method to continue checking out. You will still have a chance to review and edit your order before it is final.
              </p>
              
              <h3 className="font-bold text-gray-900 text-lg mb-2">Order Summary</h3>
              
              <div className="space-y-1 text-sm text-gray-700 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>₹{totalAmount.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>₹0.00</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-xl text-red-700">Order Total:</span>
                <span className="font-bold text-xl text-red-700">₹{totalAmount.toLocaleString('en-IN')}.00</span>
              </div>
              
              <div className="bg-gray-100 p-3 rounded text-xs text-gray-600 border border-gray-200">
                How are delivery costs calculated?
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
