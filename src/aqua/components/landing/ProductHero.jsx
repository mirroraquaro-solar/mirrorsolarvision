import React, { useState } from 'react';
import { ShoppingBag, Zap, ShieldCheck, CheckCircle2, Truck, Star, MapPin, Check, Plus, Minus } from 'lucide-react';
import { ProductGallery } from './ProductGallery.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { analytics } from '../../services/analytics.js';
import './ProductLanding.css';

export function ProductHero({ product, onNavigate }) {
  const { addToCart, addItem, buyNow, setIsCartOpen } = useCart();

  // Pack Type State: 'single' | 'bulk' | 'custom'
  const [selectedPackType, setSelectedPackType] = useState('single');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Pricing Calculation: Single <10 pieces: ₹199/pc (MRP ₹549/pc), >=10 pieces: ₹180/pc (MRP ₹549/pc)
  const isBulkRate = selectedPackType === 'bulk' || quantity >= 10;
  const unitPrice = isBulkRate ? 180 : 199;
  const unitMrp = 549;
  const currentPrice = quantity * unitPrice;
  const currentMrp = quantity * unitMrp;
  const totalSavings = currentMrp - currentPrice;
  const savingsPercent = Math.round(((currentMrp - currentPrice) / currentMrp) * 100);

  const isOutOfStock = product?.stockStatus === 'outofstock' || product?.stock === 0;

  const handlePresetSelect = (presetQty, packType = 'custom') => {
    setSelectedPackType(packType);
    setQuantity(presetQty);
    analytics.trackQuantitySelect(product, presetQty, `${presetQty} Piece(s)`);
  };

  const handleQuantityChange = (newQty) => {
    const val = Math.max(1, Math.min(500, parseInt(newQty, 10) || 1));
    setSelectedPackType('custom');
    setQuantity(val);
    analytics.trackQuantitySelect(product, val, `Custom ${val} Units`);
  };

  const getItemPayload = () => ({
    id: `ma-spun-filter-120g-${selectedPackType}-${quantity}`,
    cartItemId: `ma-spun-filter-120g-${selectedPackType}-${quantity}`,
    itemKey: `ma-spun-filter-120g-${selectedPackType}-${quantity}`,
    productId: 'ma-pp-10-05m',
    name: 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter (120 Grams)',
    category: 'Mirror Aqua',
    variant: `${quantity} Piece${quantity > 1 ? 's' : ''} (120g)`,
    price: unitPrice,
    mrp: unitMrp,
    weight: '120g',
    image: '/images/product/008.jpeg'
  });

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const itemToAdd = getItemPayload();
    addToCart(itemToAdd, quantity);
    analytics.trackAddToCart(itemToAdd, quantity);
    if (setIsCartOpen) setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const itemToAdd = getItemPayload();
    if (typeof buyNow === 'function') {
      buyNow(itemToAdd, quantity);
    } else {
      addToCart(itemToAdd, quantity);
    }
    analytics.trackBuyNow(itemToAdd, quantity);
    if (typeof onNavigate === 'function') {
      onNavigate('store', 'checkout');
    } else {
      window.location.hash = '#store';
    }
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setPincodeStatus({ valid: false, message: 'Please enter a valid 6-digit Indian pincode.' });
      return;
    }
    setPincodeStatus({ valid: true, message: `Dispatches in 24 hrs to ${pincode.trim()} via Pan-India Courier.` });
  };

  const scrollToReviews = (e) => {
    e.preventDefault();
    const el = document.getElementById('reviews');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBulk = (e) => {
    e.preventDefault();
    const el = document.getElementById('bulk-enquiry');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="product-hero-section" aria-label="Mirror Aqua Spun Filter Product Overview">
      <div className="container product-hero-container">
        {/* Left / Top Column: High-Res Interactive Gallery */}
        <div className="hero-gallery-col">
          <ProductGallery
            images={product?.images || []}
            productName={product?.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter (120 Grams)'}
          />
        </div>

        {/* Right / Next Column: Product Information, Live Pricing & Purchase Configurator */}
        <div className="hero-details-col">
          {/* Brand & Breadcrumb Pill */}
          <div className="hero-eyebrow-row">
            <span className="brand-tag">MIRROR AQUA OFFICIAL</span>
            <div className="hero-rating-wrap" onClick={scrollToReviews} role="button" tabIndex={0}>
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className="star-filled" />
                ))}
              </div>
              <span className="rating-score">4.9 / 5.0</span>
              <span className="rating-count">(340+ Verified Reviews)</span>
            </div>
          </div>

          {/* Primary Product Title */}
          <h1 className="hero-product-title">
            10-INCH 5-MICRON PP SPUN FILTER <span className="text-cyan-600 font-black">(120 GRAMS)</span>
          </h1>
          <p className="hero-product-subtitle">
            Heavy 120-gram precision-engineered 5-micron depth pre-filter for standard 10-inch bowls. 100% pure virgin polypropylene with multi-layer gradient matrix.
          </p>

          {/* Feature Badges */}
          <div className="hero-feature-badges">
            <span className="hero-badge badge-amber font-black">⚡ 120 Grams Heavy Duty</span>
            <span className="hero-badge badge-cyan">5 Micron Depth</span>
            <span className="hero-badge badge-emerald">100% Virgin PP</span>
            <span className="hero-badge badge-slate">Universal 10-Inch Fit</span>
            <span className="hero-badge badge-slate">Made in India</span>
          </div>

          {/* Pricing Glass Card */}
          <div className="hero-price-block">
            <div className="price-main-row">
              <span className="price-currency">₹</span>
              <span className="price-amount">{currentPrice.toLocaleString('en-IN')}</span>
              <span className="price-mrp">
                MRP ₹{currentMrp.toLocaleString('en-IN')}
              </span>
              <span className="price-discount-tag">
                {savingsPercent}% OFF
              </span>
            </div>

            <p className="price-unit-note">
              {quantity === 1 ? (
                <>Single 120g cartridge • <strong>₹199 / piece</strong> (MRP ₹549 • Save ₹350)</>
              ) : (
                <>Unit price: <strong>₹{unitPrice} per piece</strong> for {quantity} units • Total savings: <strong>₹{totalSavings.toLocaleString('en-IN')}</strong></>
              )}
            </p>

            {/* Live Stock Status */}
            <div className="hero-stock-indicator">
              <span className={`stock-dot ${isOutOfStock ? 'dot-red' : 'dot-green'}`} />
              <span className="stock-text">
                {isOutOfStock
                  ? 'Temporarily Out of Stock — Pre-order on WhatsApp'
                  : 'In Stock (120g Genuine) — Dispatches within 24 Hours'}
              </span>
            </div>
          </div>

          {/* Flexible Quantity & Pack Selector */}
          <div className="hero-pack-selector-block">
            <div className="pack-selector-header">
              <span className="pack-label-title">Select Quantity or Pack:</span>
              <a href="#bulk-enquiry" onClick={scrollToBulk} className="bulk-link-hint">
                Need 50+ pieces? Get B2B Trade Quote
              </a>
            </div>

            {/* Quick Pack Preset Cards */}
            <div className="pack-options-grid-presets">
              {/* Option 1: 1 Piece Standard ₹199 */}
              <button
                type="button"
                className={`pack-card-hero ${selectedPackType === 'single' && quantity === 1 ? 'selected' : ''}`}
                onClick={() => handlePresetSelect(1, 'single')}
              >
                <div className="pack-card-top">
                  <div className="pack-radio-circle">
                    {selectedPackType === 'single' && quantity === 1 && <div className="pack-radio-inner" />}
                  </div>
                  <span className="pack-name-hero">1 Piece (120g Standard)</span>
                  <span className="pack-price-hero">₹199</span>
                </div>
                <div className="pack-sub-info">
                  <span>120g Heavy Pack • ₹199/pc • 64% OFF (MRP ₹549)</span>
                </div>
              </button>

              {/* Option 2: 10 Pieces Value Pack ₹1,800 */}
              <button
                type="button"
                className={`pack-card-hero ${selectedPackType === 'bulk' || quantity === 10 ? 'selected' : ''}`}
                onClick={() => handlePresetSelect(10, 'bulk')}
              >
                <span className="pack-badge-hero popular-badge">
                  ⭐ BEST VALUE • SAVE ₹3,690
                </span>
                <div className="pack-card-top">
                  <div className="pack-radio-circle">
                    {(selectedPackType === 'bulk' || quantity === 10) && <div className="pack-radio-inner" />}
                  </div>
                  <span className="pack-name-hero">10 Pieces (Value Pack - 1.2kg)</span>
                  <span className="pack-price-hero">₹1,800</span>
                </div>
                <div className="pack-sub-info">
                  <span>Wholesale Rate • ₹180/pc • 67% OFF (MRP ₹5,490)</span>
                </div>
              </button>
            </div>

            {/* Custom Quantity Stepper */}
            <div className="custom-qty-section">
              <div className="custom-qty-label-row">
                <span className="custom-qty-label">Or Enter Any Custom Quantity:</span>
                {quantity < 10 && (
                  <span className="custom-qty-hint">
                    💡 Tip: Buy 9 more to unlock <strong>₹180/pc</strong> rate
                  </span>
                )}
              </div>

              <div className="custom-qty-controls-row">
                <div className="stepper-box-hero">
                  <button
                    type="button"
                    className="stepper-btn-hero"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    className="stepper-input-hero font-bold"
                    aria-label="Custom quantity input"
                  />
                  <button
                    type="button"
                    className="stepper-btn-hero"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="quick-qty-chips">
                  {[2, 3, 5, 20, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`qty-chip ${quantity === preset ? 'active' : ''}`}
                      onClick={() => handlePresetSelect(preset, preset >= 10 ? 'bulk' : 'custom')}
                    >
                      {preset} Pcs
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA Action Buttons */}
          <div className="hero-cta-buttons-block">
            <button
              type="button"
              id="hero-buy-now-btn"
              className="hero-btn-primary"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              <Zap size={18} className="fill-current" />
              <span>
                BUY NOW • ₹{currentPrice.toLocaleString('en-IN')}
              </span>
            </button>

            <button
              type="button"
              id="hero-add-to-cart-btn"
              className="hero-btn-secondary"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingBag size={18} />
              <span>ADD TO CART</span>
            </button>
          </div>

          {/* Pincode Serviceability & Logistics Check */}
          <div className="hero-pincode-box">
            <form onSubmit={handleCheckPincode} className="pincode-form">
              <MapPin size={16} className="pincode-icon" />
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit delivery pincode..."
                className="pincode-input"
              />
              <button type="submit" className="pincode-btn">
                Check Delivery
              </button>
            </form>

            {pincodeStatus && (
              <div className={`pincode-status ${pincodeStatus.valid ? 'status-success' : 'status-error'}`}>
                {pincodeStatus.valid ? <CheckCircle2 size={14} /> : <span className="status-err-dot">●</span>}
                <span>{pincodeStatus.message}</span>
              </div>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="hero-trust-badges-row">
            <div className="trust-item">
              <Truck size={16} className="trust-icon" />
              <span>Fast Shiprocket Dispatch</span>
            </div>
            <div className="trust-item">
              <ShieldCheck size={16} className="trust-icon" />
              <span>100% Fit Guarantee</span>
            </div>
            <div className="trust-item">
              <CheckCircle2 size={16} className="trust-icon" />
              <span>120g Heavy Duty Media</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
