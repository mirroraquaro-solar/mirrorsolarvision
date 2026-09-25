import React, { useState } from 'react';
import { ShoppingBag, Zap, ShieldCheck, CheckCircle2, Truck, Star, MapPin, Check } from 'lucide-react';
import { ProductGallery } from './ProductGallery.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { analytics } from '../../services/analytics.js';
import './ProductLanding.css';

export function ProductHero({ product, onNavigate }) {
  const { addToCart, addItem, setIsCartOpen } = useCart();

  // Pack Type State: 'single' | 'bulk' | 'custom'
  const [selectedPackType, setSelectedPackType] = useState('single');
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Pricing Calculation: Single <10 pieces: ₹199/pc (MRP ₹399/pc), >=10 pieces: ₹180/pc (MRP ₹399/pc)
  const isBulkRate = selectedPackType === 'bulk' || quantity >= 10;
  const unitPrice = isBulkRate ? 180 : 199;
  const unitMrp = 399;
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

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const addFn = addToCart || addItem;
    const itemToAdd = {
      ...product,
      id: product?.id || 'ma-prod-001',
      price: unitPrice,
      sku: product?.sku || 'MA-PP-10-05M',
      name: product?.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter',
      selectedPack: `${quantity} Piece${quantity > 1 ? 's' : ''}`
    };
    if (typeof addFn === 'function') {
      addFn(itemToAdd, quantity);
    }
    analytics.trackAddToCart(itemToAdd, quantity);
    if (setIsCartOpen) setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const addFn = addToCart || addItem;
    const itemToAdd = {
      ...product,
      id: product?.id || 'ma-prod-001',
      price: unitPrice,
      sku: product?.sku || 'MA-PP-10-05M',
      name: product?.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter',
      selectedPack: `${quantity} Piece${quantity > 1 ? 's' : ''}`
    };
    if (typeof addFn === 'function') {
      addFn(itemToAdd, quantity);
    }
    analytics.trackBuyNow(itemToAdd, quantity);
    onNavigate('/checkout');
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
    const el = document.getElementById('reviews-section');
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
            productName={product?.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter'}
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
            10-INCH 5-MICRON PP SPUN SEDIMENT FILTER
          </h1>
          <p className="hero-product-subtitle">
            Precision-engineered 5-micron depth sediment filter for standard 10-inch pre-filter bowls. 100% pure melt-blown polypropylene with gradient multi-layer structure.
          </p>

          {/* Feature Badges */}
          <div className="hero-feature-badges">
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
              {currentMrp > currentPrice && (
                <span className="price-mrp">
                  MRP ₹{currentMrp.toLocaleString('en-IN')}
                </span>
              )}
              {savingsPercent > 0 && (
                <span className="price-discount-tag">
                  {savingsPercent}% OFF
                </span>
              )}
            </div>

            <p className="price-unit-note">
              {quantity === 1 ? (
                <>Single cartridge pack • <strong>₹199 / piece</strong> (Includes all taxes)</>
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
                  : 'In Stock — Dispatches within 24 Hours via Pan-India Courier'}
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
                  <span className="pack-name-hero">1 Piece (Standard)</span>
                  <span className="pack-price-hero">₹199</span>
                </div>
                <div className="pack-sub-info">
                  <span>Standard Pack • ₹199/pc • 50% OFF</span>
                </div>
              </button>

              {/* Option 2: 10 Pieces Value Pack ₹1,800 */}
              <button
                type="button"
                className={`pack-card-hero ${selectedPackType === 'bulk' || quantity === 10 ? 'selected' : ''}`}
                onClick={() => handlePresetSelect(10, 'bulk')}
              >
                <span className="pack-badge-hero popular-badge">
                  ⭐ Best Value • Save ₹2,190
                </span>
                <div className="pack-card-top">
                  <div className="pack-radio-circle">
                    {(selectedPackType === 'bulk' || quantity === 10) && <div className="pack-radio-inner" />}
                  </div>
                  <span className="pack-name-hero">10 Pieces (Value Pack)</span>
                  <span className="pack-price-hero">₹1,800</span>
                </div>
                <div className="pack-sub-info">
                  <span>Wholesale Rate • ₹180/pc • 55% OFF</span>
                </div>
              </button>
            </div>

            {/* Custom Quantity Stepper */}
            <div className="custom-qty-container">
              <div className="custom-qty-label-row">
                <span className="custom-qty-title">Or Enter Any Custom Quantity:</span>
                {quantity < 10 ? (
                  <span className="custom-qty-hint">
                    💡 Tip: Buy <strong>{10 - quantity} more</strong> to unlock <strong>₹180/pc</strong> rate!
                  </span>
                ) : (
                  <span className="custom-qty-hint success">
                    🎉 Value Tier Applied: <strong>₹180 / piece</strong>
                  </span>
                )}
              </div>

              <div className="custom-qty-controls">
                <button
                  type="button"
                  className="qty-stepper-btn"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="qty-stepper-input"
                  aria-label="Filter quantity"
                />
                <button
                  type="button"
                  className="qty-stepper-btn"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
                <div className="qty-quick-buttons">
                  {[2, 3, 5, 20].map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`qty-quick-pill ${quantity === q ? 'active' : ''}`}
                      onClick={() => handlePresetSelect(q)}
                    >
                      {q} Pcs
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* High-Conversion Action Buttons */}
          <div className="hero-cta-group">
            <button
              type="button"
              className="cta-btn cta-buy-now"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
            >
              <Zap size={18} />
              <span>BUY NOW • ₹{currentPrice.toLocaleString('en-IN')} ({quantity} {quantity > 1 ? 'Units' : 'Unit'})</span>
            </button>

            <button
              type="button"
              className="cta-btn cta-add-cart"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingBag size={18} />
              <span>ADD {quantity > 1 ? `(${quantity})` : ''} TO CART</span>
            </button>
          </div>

          {/* Integrated Pincode Checker */}
          <div className="hero-pincode-checker">
            <form onSubmit={handleCheckPincode} className="pincode-form">
              <div className="pincode-input-wrap">
                <MapPin size={16} className="pincode-icon" />
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit delivery pincode"
                  className="pincode-input"
                />
              </div>
              <button type="submit" className="pincode-check-btn">
                Check
              </button>
            </form>
            {pincodeStatus && (
              <p className={`pincode-result ${pincodeStatus.valid ? 'valid' : 'invalid'}`}>
                {pincodeStatus.valid && <Check size={14} />}
                {pincodeStatus.message}
              </p>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="hero-trust-indicators">
            <div className="trust-indicator-item">
              <Truck size={16} />
              <span>Pan-India Courier Dispatch</span>
            </div>
            <div className="trust-indicator-item">
              <ShieldCheck size={16} />
              <span>100% Virgin Food-Grade Polypropylene</span>
            </div>
            <div className="trust-indicator-item">
              <CheckCircle2 size={16} />
              <span>Fits Standard 10-Inch Bowls</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
