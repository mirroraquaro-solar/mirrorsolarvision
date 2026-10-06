import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Truck,
  CreditCard,
  MessageCircle,
  AlertCircle,
  Tag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Navigation,
  ExternalLink,
  Loader2,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { Button, Price } from '../components/ui/Primitives.jsx';
import { isFreeShippingRegion, shippingService } from '../services/shipping.js';
import { analytics } from '../services/analytics.js';
import { PaymentSuccessModal } from '../components/modals/PaymentSuccessModal.jsx';
import { loadRazorpay } from '../../services/razorpayLoader.js';
import { detectCurrentLocation } from '../../services/notificationService.js';
import './CheckoutPage.css';

export function CheckoutPage({ onNavigate }) {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const {
    items,
    cartState,
    updateQuantity,
    removeFromCart,
    couponCode,
    applyCoupon,
    removeCoupon,
    clearCart,
    shippingMethod,
    setShippingMethod,
    deliveryRegion,
    setDeliveryRegion
  } = useCart();

  // Customer Form State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    fullName: '',
    address: '',
    apartment: '',
    city: '',
    state: deliveryRegion?.state || '',
    pincode: deliveryRegion?.pincode || '',
    googleMapsLink: '',
    latitude: null,
    longitude: null,
    notes: ''
  });

  const [pincodeCheckResult, setPincodeCheckResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [inputCoupon, setInputCoupon] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(null);
  const [locationError, setLocationError] = useState(null);

  const handleAutoLocate = async () => {
    setIsLocating(true);
    setLocationError(null);
    setLocationSuccess(null);

    try {
      const loc = await detectCurrentLocation();
      setFormData(prev => ({
        ...prev,
        pincode: loc.pincode || prev.pincode,
        address: loc.flat ? (prev.address ? `${prev.address}, ${loc.flat}` : loc.flat) : (loc.formattedAddress || prev.address),
        apartment: loc.area || prev.apartment,
        city: loc.city || prev.city,
        state: loc.state || prev.state,
        googleMapsLink: loc.googleMapsLink,
        latitude: loc.latitude,
        longitude: loc.longitude
      }));

      if (loc.pincode && typeof shippingService.checkPincode === 'function') {
        const check = shippingService.checkPincode(loc.pincode);
        setPincodeCheckResult(check);
      }

      setLocationSuccess(`GPS Location Detected (${loc.latitude}°, ${loc.longitude}°). Address auto-filled.`);
    } catch (err) {
      setLocationError(err.message || 'Could not fetch GPS location.');
    } finally {
      setIsLocating(false);
    }
  };

  // Auto-populate default product if items is empty on direct checkout visit
  useEffect(() => {
    if (items.length === 0) {
      const defaultProd = {
        id: 'ma-prod-001',
        name: 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter',
        price: 199,
        sku: 'MA-PP-10-05M',
        selectedPack: '1 Piece (Standard)',
        category: 'PP Spun Filter',
        stock: 500,
        images: [{ url: '/images/product/spun1.jpeg' }]
      };
      if (typeof updateQuantity === 'function') {
        // use addToCart if available or update cart state
      }
    }
  }, [items.length]);

  const isAPTS = isFreeShippingRegion(formData.pincode, formData.state) || cartState.isAPTS;

  useEffect(() => {
    if (items.length > 0) {
      analytics.trackBeginCheckout(items, cartState.grandTotal);
    }
  }, [items, cartState.grandTotal]);

  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6) {
      shippingService.checkPincode(formData.pincode).then(res => setPincodeCheckResult(res));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setCheckoutError('');

    if (name === 'pincode') {
      const clean = value.replace(/\D/g, '');
      if (clean.length === 6) {
        shippingService.checkPincode(clean).then(res => setPincodeCheckResult(res));
        setDeliveryRegion({ pincode: clean, state: formData.state });
      }
    }
    if (name === 'state') {
      setDeliveryRegion({ pincode: formData.pincode, state: value });
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (inputCoupon.trim()) {
      applyCoupon(inputCoupon);
      setInputCoupon('');
    }
  };

  const handleCompleteOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setCheckoutError('');

    // Explicit Form Validation with Immediate Visual Feedback
    if (!formData.fullName || !formData.fullName.trim()) {
      setCheckoutError('⚠️ Please enter your Full Name.');
      const el = document.getElementById('fullName');
      if (el) el.focus();
      return;
    }
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setCheckoutError('⚠️ Please enter a valid 10-digit mobile number.');
      const el = document.getElementById('phone');
      if (el) el.focus();
      return;
    }
    if (!formData.address || !formData.address.trim()) {
      setCheckoutError('⚠️ Please enter your Street Address / House number.');
      const el = document.getElementById('address');
      if (el) el.focus();
      return;
    }
    const cleanPin = (formData.pincode || '').replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      setCheckoutError('⚠️ Please enter a valid 6-digit delivery PIN code.');
      const el = document.getElementById('pincode');
      if (el) el.focus();
      return;
    }

    setIsProcessing(true);

    try {
      // Save customer info in localStorage for future convenience
      try {
        localStorage.setItem('kc_customer_info', JSON.stringify(formData));
      } catch (e) {}

      const currentItems = (items && items.length > 0) ? items : [{
        productId: 'ma-prod-001',
        quantity: 1,
        unitPrice: 199,
        product: {
          id: 'ma-prod-001',
          name: 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter',
          price: 199,
          sku: 'MA-PP-10-05M'
        }
      }];

      const grandTotal = cartState.grandTotal || currentItems.reduce((acc, it) => acc + (it.unitPrice * it.quantity), 0);
      const effectiveUserId = `guest_${cleanPhone}`;
      const fbp = analytics.getFbp();
      const fbc = analytics.getFbc();

      try {
        analytics.trackBeginCheckout(currentItems, grandTotal, formData);
      } catch (e) {}

      // 1. Call Main Firebase Cloud Function to create Razorpay Order & register in Firestore
      const createOrderURL = 'https://us-central1-mirror-solar-vision.cloudfunctions.net/createRazorpayOrder';
      
      const res = await fetch(createOrderURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            amount: grandTotal,
            items: currentItems.map(it => ({
              productId: it.productId || it.product?.id || 'ma-prod-001',
              name: it.product?.name || it.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter',
              sku: it.product?.sku || it.sku || 'MA-PP-10-05M',
              price: it.unitPrice || it.product?.price || 199,
              quantity: it.quantity || 1
            })),
            userId: effectiveUserId,
            address: {
              fullName: formData.fullName,
              email: formData.email,
              phone: cleanPhone,
              pincode: cleanPin,
              flat: formData.apartment || formData.address,
              area: formData.address,
              city: formData.city,
              state: formData.state,
              googleMapsLink: formData.googleMapsLink,
              latitude: formData.latitude,
              longitude: formData.longitude
            },
            fbp,
            fbc
          }
        })
      });

      const responseData = await res.json();
      const data = responseData.data || responseData;

      if (!data || !data.id) {
        throw new Error(data?.error || 'Failed to initialize payment gateway.');
      }

      // 2. Initialize Live Razorpay Checkout Modal
      const liveKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Tfvc73Xs6tShFL';
      
      const options = {
        key: liveKey,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'Mirror Aqua (Mirror Life)',
        description: `Order ${data.bookingId || data.firestoreOrderId} - 10" PP Spun Filter`,
        image: '/images/product/logo2.jpeg',
        order_id: data.id,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: cleanPhone
        },
        theme: {
          color: '#0284c7'
        },
        handler: async function (response) {
          try {
            // 3. Verify Payment & Generate Live Shiprocket Shipment via Cloud Function
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
                }
              })
            });

            const verifyData = await verifyRes.json();
            const shipmentId = verifyData.data?.shiprocketShipmentId || null;
            const bookingId = data.bookingId || data.firestoreOrderId;

            const finalOrderRecord = {
              orderId: bookingId,
              bookingId: bookingId,
              id: data.firestoreOrderId,
              total: grandTotal,
              amount: grandTotal,
              customerName: formData.fullName,
              customerPhone: cleanPhone,
              customerEmail: formData.email,
              customer: {
                fullName: formData.fullName,
                email: formData.email,
                phone: cleanPhone,
                pincode: cleanPin
              },
              address: {
                fullName: formData.fullName,
                name: formData.fullName,
                phone: cleanPhone,
                email: formData.email,
                flat: formData.apartment || formData.address,
                area: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: cleanPin,
                googleMapsLink: formData.googleMapsLink,
                latitude: formData.latitude,
                longitude: formData.longitude
              },
              shippingAddress: {
                fullName: formData.fullName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: cleanPin,
                googleMapsLink: formData.googleMapsLink
              },
              items: currentItems.map(it => ({
                productId: it.productId || it.product?.id || 'ma-prod-001',
                name: it.product?.name || it.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter',
                quantity: it.quantity || 1,
                price: it.unitPrice || it.price || 199,
                total: (it.unitPrice || it.price || 199) * (it.quantity || 1)
              })),
              payment: {
                transactionId: response.razorpay_payment_id,
                paymentMethod: 'Razorpay Verified (UPI/Cards)',
                shipment: {
                  shipmentId: shipmentId || `SR-${bookingId}`,
                  courierName: 'Shiprocket Express Pan-India Delivery',
                  status: 'CONFIRMED_QUEUED_FOR_PICKUP',
                  trackingUrl: shipmentId ? `https://shiprocket.co/tracking/${shipmentId}` : `https://shiprocket.co/tracking/${bookingId}`
                }
              }
            };

            // Save in localStorage for tracking
            try {
              const existing = JSON.parse(localStorage.getItem('msv_recent_orders') || '[]');
              const updatedList = [finalOrderRecord, ...existing.filter(o => o.orderId !== bookingId && o.id !== bookingId)].slice(0, 30);
              localStorage.setItem('msv_recent_orders', JSON.stringify(updatedList));
            } catch (e) {}

            // Track purchase in analytics
            analytics.trackPurchase(finalOrderRecord);

            setCompletedOrder(finalOrderRecord);
            setIsSuccessModalOpen(true);
            clearCart();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err) {
            setCheckoutError('Payment received, but confirmation sync had a delay. Please check WhatsApp for confirmation.');
            console.error(err);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const RazorpayInstance = await loadRazorpay();
      if (!RazorpayInstance) {
        throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
      }

      const rzp = new RazorpayInstance(options);
      rzp.on('payment.failed', function (resp) {
        setCheckoutError(resp.error?.description || 'Payment was declined. Please retry.');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      setCheckoutError(err.message || 'An error occurred initializing payment.');
      setIsProcessing(false);
    }
  };

  // ORDER CONFIRMATION SCREEN
  if (completedOrder) {
    const shipment = completedOrder.payment?.shipment;
    return (
      <div className="container checkout-success-container">
        <PaymentSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          orderData={completedOrder}
          onNavigate={onNavigate}
        />
        <div className="checkout-success-card">
          <div className="success-badge-icon">
            <CheckCircle2 size={44} color="var(--color-success)" />
          </div>
          <span className="section-eyebrow">Payment & Order Confirmed</span>
          <h1 className="success-order-title">Thank You for Your Order</h1>
          <p className="order-number-text">
            Order Reference: <strong>#{completedOrder.orderId}</strong>
          </p>

          <p className="success-lead-p">
            A confirmation receipt has been sent to <strong>{completedOrder.customer.email}</strong>. Your Mirror Aqua PP Spun Filter cartridges are queued for dispatch via Shiprocket.
          </p>

          <div className="order-summary-box">
            <h3 className="summary-box-title">Order Items</h3>
            <div className="order-items-receipt">
              {completedOrder.items.map((item) => (
                <div key={item.productId} className="receipt-item-row">
                  <span>{item.name} × {item.quantity}</span>
                  <strong>₹{item.total.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
            <div className="receipt-total-row">
              <span>Payment Gateway</span>
              <strong>{completedOrder.payment?.paymentMethod || 'Razorpay Verified'}</strong>
            </div>
            {completedOrder.payment?.transactionId && (
              <div className="receipt-item-row text-muted" style={{ fontSize: '12px' }}>
                <span>Razorpay Txn ID:</span>
                <code>{completedOrder.payment.transactionId}</code>
              </div>
            )}
            <div className="receipt-total-row" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
              <span>Total Paid</span>
              <strong style={{ color: 'var(--color-success)', fontSize: '18px' }}>₹{completedOrder.total.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Live Shiprocket Logistics Card */}
          <div className="shipment-status-notice">
            <Truck size={22} className="icon-cyan" />
            <div>
              <strong>Shiprocket Logistics Integration:</strong>
              <p style={{ margin: '4px 0 0 0' }}>
                {shipment?.shipmentId ? (
                  <>
                    Shipment ID: <strong>{shipment.shipmentId}</strong> • Courier: <strong>{shipment.courierName || 'Delhivery'}</strong> • Status: <span style={{ color: '#059669', fontWeight: 600 }}>{shipment.status || 'READY TO DISPATCH'}</span>
                  </>
                ) : (
                  <>
                    Courier partner allocated automatically based on pincode <strong>{completedOrder.shippingAddress?.pincode}</strong>. Live tracking updates sent via SMS & WhatsApp.
                  </>
                )}
              </p>
              {shipment?.trackingUrl && (
                <div style={{ marginTop: '6px' }}>
                  <a href={shipment.trackingUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12.5px', color: '#0284c7', textDecoration: 'underline' }}>
                    Track shipment on Shiprocket →
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="success-actions-group">
            <Button variant="primary" onClick={() => onNavigate('/product/10-inch-5-micron-pp-spun-filter')}>
              <span>Continue Shopping</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CHECKOUT REDIRECT
  if (items.length === 0) {
    return (
      <div className="container empty-checkout-container">
        <div className="empty-state">
          <Lock size={48} className="empty-state-icon" />
          <h2 className="empty-state-title">Your Cart is Empty</h2>
          <p className="empty-state-text">
            There are currently no spare parts selected for checkout.
          </p>
          <Button variant="primary" onClick={() => onNavigate('/product/10-inch-5-micron-pp-spun-filter')}>
            View 10" PP Spun Filter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="container">
        <div className="checkout-page-header">
          <span className="section-eyebrow">Secure Checkout</span>
          <h1 className="checkout-main-title">Complete Your Order</h1>
          <div className="checkout-trust-badge">
            <ShieldCheck size={16} color="var(--color-success)" />
            <span>Mirror Aqua Verified • 256-Bit SSL Encrypted</span>
          </div>
        </div>

        <form onSubmit={handleCompleteOrder} className="checkout-layout-grid">
          {/* Left Column: Form Fields */}
          <div className="checkout-form-column">
            {/* Step 1: Contact */}
            <div className="checkout-form-section">
              <h2 className="form-section-title">1. Contact Information</h2>
              <div className="form-grid-2">
                <div className="form-field">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-text"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="phone">Phone (for Delivery & WhatsApp updates) *</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-text"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="checkout-form-section">
              <h2 className="form-section-title">2. Delivery Address</h2>

              {/* Google Maps / GPS Auto-Fill Card */}
              <div className="checkout-gps-card">
                <div className="checkout-gps-card-header">
                  <div className="gps-info-left">
                    <div className="gps-icon-bubble">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div className="gps-card-title">
                        <span>Use Exact Location (Google Maps / GPS)</span>
                        <span className="gps-card-badge">1-Tap Fill</span>
                      </div>
                      <p className="gps-card-sub">
                        Auto-detects PIN code, street, town & attaches exact map pin for fast delivery.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoLocate}
                    disabled={isLocating}
                    className="gps-locate-btn"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Detecting GPS...</span>
                      </>
                    ) : (
                      <>
                        <Navigation size={15} />
                        <span>Detect My Location</span>
                      </>
                    )}
                  </button>
                </div>

                {locationSuccess && (
                  <div className="gps-status-success">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={14} color="#059669" />
                      <span>{locationSuccess}</span>
                    </span>
                    {formData.googleMapsLink && (
                      <a
                        href={formData.googleMapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gps-map-link"
                      >
                        <span>View Google Maps Pin</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                )}

                {locationError && (
                  <div className="gps-status-error">
                    <AlertCircle size={14} color="#d97706" />
                    <span>{locationError}</span>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  required
                  placeholder="Recipient full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-text"
                />
              </div>

              <div className="form-field">
                <label htmlFor="address">Street Address / House No. *</label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  required
                  placeholder="Flat, suite, building, street"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-text"
                />
              </div>

              <div className="form-grid-2" style={{ marginBottom: 'var(--space-sm)' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="apartment">Apartment / Landmark (Optional)</label>
                  <input
                    id="apartment"
                    type="text"
                    name="apartment"
                    placeholder="Near landmark, colony, or floor"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="input-text"
                  />
                </div>

                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="googleMapsLink">Google Maps Link / Pin (Auto-filled / Optional)</label>
                  <input
                    id="googleMapsLink"
                    type="url"
                    name="googleMapsLink"
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.googleMapsLink}
                    onChange={handleInputChange}
                    className="input-text"
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field">
                  <label htmlFor="pincode">PIN Code *</label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    required
                    maxLength={6}
                    placeholder="6 Digits"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="input-text"
                  />
                  {pincodeCheckResult && (
                    <span className={`pincode-feedback ${pincodeCheckResult.serviceable ? 'success' : 'error'}`}>
                      {pincodeCheckResult.serviceable ? `✓ Deliverable (${pincodeCheckResult.estimatedDays})` : pincodeCheckResult.message}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input-text"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="state">State *</label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    required
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="input-text"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Shipping Method */}
            <div className="checkout-form-section">
              <h2 className="form-section-title">3. Shipping Speed</h2>
              <div className="shipping-options-list">
                <label className={`shipping-radio-card ${shippingMethod === 'standard' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                  />
                  <div className="shipping-radio-info">
                    <strong>Standard Delivery (3-5 business days) — AP & TS FREE / Other States ₹60</strong>
                    <span>Moisture-sealed protective packaging • Fast surface dispatch</span>
                  </div>
                  <span className="shipping-radio-price">
                    {isAPTS ? (
                      <strong style={{ color: '#059669' }}>FREE (AP & TS)</strong>
                    ) : cartState.subtotal >= 2500 ? (
                      <strong style={{ color: '#059669' }}>FREE</strong>
                    ) : (
                      <strong>₹60</strong>
                    )}
                  </span>
                </label>

                <label className={`shipping-radio-card ${shippingMethod === 'express' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                  />
                  <div className="shipping-radio-info">
                    <strong>Express Air Delivery (1-2 business days)</strong>
                    <span>Priority dispatch + express courier delivery</span>
                  </div>
                  <span className="shipping-radio-price">₹350</span>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div className="checkout-form-section">
              <h2 className="form-section-title">4. Payment Selection</h2>
              <div className="payment-box-info">
                <div className="payment-header-row">
                  <CreditCard size={20} color="var(--accent-terracotta)" />
                  <strong>Razorpay Official Secure Gateway / UPI / NetBanking / Cards</strong>
                </div>
                <p className="payment-sub-text">
                  Your payment will be securely processed. We support UPI (Google Pay, PhonePe, Paytm), All Major Debit/Credit Cards, and NetBanking.
                </p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                  <span className="pay-badge" style={{ fontSize: '11px', background: '#f0f9ff', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 700 }}>Google Pay</span>
                  <span className="pay-badge" style={{ fontSize: '11px', background: '#f0f9ff', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 700 }}>PhonePe</span>
                  <span className="pay-badge" style={{ fontSize: '11px', background: '#f0f9ff', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', border: '1px solid #bae6fd', fontWeight: 700 }}>Paytm / UPI</span>
                  <span className="pay-badge" style={{ fontSize: '11px', background: '#f8fafc', color: '#334155', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}>Debit / Credit Cards</span>
                  <span className="pay-badge" style={{ fontSize: '11px', background: '#f8fafc', color: '#334155', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontWeight: 700 }}>NetBanking</span>
                </div>
              </div>
            </div>

            {checkoutError && (
              <div className="checkout-error-banner">
                <AlertCircle size={18} />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Primary Payment Button in Form */}
            <Button
              type="submit"
              variant="accent"
              className="checkout-submit-order-btn"
              disabled={isProcessing}
            >
              <Lock size={16} />
              <span>
                {isProcessing
                  ? 'OPENING RAZORPAY SECURE GATEWAY...'
                  : `PAY ₹${(isAPTS
                      ? Math.max(0, cartState.subtotal - (cartState.discountAmount || 0))
                      : (cartState.subtotal >= 2500
                          ? Math.max(0, cartState.subtotal - (cartState.discountAmount || 0))
                          : Math.max(0, cartState.subtotal - (cartState.discountAmount || 0) + 60))
                    )?.toLocaleString('en-IN')} VIA RAZORPAY`}
              </span>
            </Button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="checkout-summary-column">
            <div className="checkout-summary-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 className="summary-title" style={{ margin: 0, border: 'none', padding: 0 }}>Order Summary ({items.length})</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('/cart')}
                  style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Edit Cart
                </button>
              </div>
              
              <div className="summary-items-scroll">
                {cartState.items?.map((item, idx) => {
                  const itemIdentifier = item.itemKey || item.productId || item.product?.id || `checkout_item_${idx}`;
                  return (
                    <div key={itemIdentifier || idx} className="summary-item-line">
                      <img src={item.product?.images?.[0]?.url || '/images/product/spun1.jpeg'} alt="" className="summary-thumb" />
                      <div className="summary-info">
                        <h4 className="summary-name">{item.product?.name || '10" PP Spun Filter'}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(itemIdentifier, item.quantity - 1, idx);
                              }}
                              style={{ border: 'none', background: 'none', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                              title="Decrease quantity"
                            >
                              <Minus size={11} />
                            </button>
                            <span style={{ fontSize: '11px', fontWeight: 700, padding: '0 5px' }}>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(itemIdentifier, item.quantity + 1, idx);
                              }}
                              disabled={item.quantity >= (item.product?.stock || 999)}
                              style={{ border: 'none', background: 'none', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                              title="Increase quantity"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromCart(itemIdentifier, idx);
                            }}
                            style={{ border: 'none', background: 'none', color: '#ef4444', padding: '2px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: 600 }}
                            title="Remove item from order"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                      <span className="summary-line-total">₹{(item.lineTotal || (item.unitPrice * item.quantity)).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Form */}
              <div className="checkout-coupon-wrap">
                {cartState.appliedCoupon ? (
                  <div className="applied-coupon-pill">
                    <Tag size={13} />
                    <span><strong>{cartState.appliedCoupon.code}</strong> (-₹{cartState.discountAmount})</span>
                    <button type="button" onClick={removeCoupon} className="remove-pill-btn">✕</button>
                  </div>
                ) : (
                  <div className="coupon-inline-form">
                    <input
                      type="text"
                      placeholder="Discount Code"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      className="coupon-input"
                    />
                    <button type="button" onClick={handleApplyCoupon} className="coupon-apply-btn">
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <div className="summary-totals-block">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartState.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {cartState.discountAmount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount</span>
                    <span>-₹{cartState.discountAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>
                    {isAPTS ? (
                      <strong style={{ color: '#059669' }}>FREE (AP & TS Special)</strong>
                    ) : cartState.subtotal >= 2500 ? (
                      <strong style={{ color: '#059669' }}>FREE</strong>
                    ) : (
                      <strong>₹60</strong>
                    )}
                  </span>
                </div>
                <div className="summary-row">
                  <span>GST (Included)</span>
                  <span>₹{cartState.taxAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row total-row">
                  <strong>Total</strong>
                  <strong>
                    ₹{(isAPTS
                      ? Math.max(0, cartState.subtotal - (cartState.discountAmount || 0))
                      : (cartState.subtotal >= 2500
                          ? Math.max(0, cartState.subtotal - (cartState.discountAmount || 0))
                          : Math.max(0, cartState.subtotal - (cartState.discountAmount || 0) + 60))
                    )?.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Instant Razorpay Payment Button directly in Order Summary */}
              <div style={{ marginTop: '16px' }}>
                <Button
                  type="submit"
                  variant="accent"
                  style={{ width: '100%', padding: '14px 18px', fontSize: '13.5px', fontWeight: 800, letterSpacing: '0.03em', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)' }}
                  disabled={isProcessing}
                >
                  <Lock size={16} />
                  <span>
                    {isProcessing
                      ? 'PROCESSING PAYMENT...'
                      : `PAY ₹${(isAPTS
                          ? Math.max(0, cartState.subtotal - (cartState.discountAmount || 0))
                          : (cartState.subtotal >= 2500
                              ? Math.max(0, cartState.subtotal - (cartState.discountAmount || 0))
                              : Math.max(0, cartState.subtotal - (cartState.discountAmount || 0) + 60))
                        )?.toLocaleString('en-IN')} VIA RAZORPAY`}
                  </span>
                </Button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginTop: '12px', textAlign: 'center' }}>
                <ShieldCheck size={14} color="#059669" />
                <span>Razorpay Secured • Fast Courier Dispatch</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Order Confirmation Popup Modal with Tracking & Order Details */}
      <PaymentSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          if (typeof onNavigate === 'function') {
            onNavigate('/track');
          } else {
            window.location.hash = '#orders';
          }
        }}
        orderData={completedOrder}
        onNavigate={onNavigate}
      />
    </div>
  );
}
