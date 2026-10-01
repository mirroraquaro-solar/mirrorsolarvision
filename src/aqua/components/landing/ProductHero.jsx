import React, { useState, useEffect } from 'react';
import { ShoppingBag, Zap, ShieldCheck, CheckCircle2, Truck, Star, MapPin, Check, Plus, Minus, Gift, Sparkles, Droplets, Layers } from 'lucide-react';
import { ProductGallery } from './ProductGallery.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { analytics } from '../../services/analytics.js';
import { PRODUCTS } from '../../data/products.js';
import './ProductLanding.css';

export function ProductHero({ product, onNavigate }) {
  const { addToCart, addItem, buyNow, setIsCartOpen } = useCart();
  
  // Local active product state to allow instant 1-click option switching
  const [activeProduct, setActiveProduct] = useState(() => product || PRODUCTS[0]);

  useEffect(() => {
    if (product) {
      setActiveProduct(product);
    }
  }, [product]);

  const currentProd = activeProduct || PRODUCTS[0];
  const isComboProduct = currentProd.id === 'ma-prod-002' || currentProd.slug?.includes('free-wrench');

  const [selectedPackTierId, setSelectedPackTierId] = useState(
    currentProd.packTiers?.[0]?.id || 'single'
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  useEffect(() => {
    setSelectedPackTierId(currentProd.packTiers?.[0]?.id || 'single');
    setQuantity(currentProd.packTiers?.[0]?.quantity || 1);
  }, [currentProd.id]);

  const handleSwitchOption = (targetProd) => {
    setActiveProduct(targetProd);
    setSelectedPackTierId(targetProd.packTiers?.[0]?.id || 'single');
    setQuantity(targetProd.packTiers?.[0]?.quantity || 1);
    if (typeof onNavigate === 'function') {
      onNavigate(`/product/${targetProd.slug}`);
    }
    analytics.trackPageView(`/product/${targetProd.slug}`);
    analytics.trackViewItem(targetProd);
  };

  // Pricing Calculation based on active product and tier
  let unitPrice = currentProd.price || 199;
  let unitMrp = currentProd.mrp || 549;

  if (isComboProduct) {
    unitPrice = quantity >= 2 ? 945 : 995;
    unitMrp = 2899;
  } else {
    unitPrice = quantity >= 10 ? 180 : 199;
    unitMrp = 549;
  }

  const activeTier = currentProd.packTiers?.find(t => t.id === selectedPackTierId);
  const currentPrice = (selectedPackTierId === activeTier?.id && activeTier && quantity === activeTier.quantity)
    ? activeTier.totalPrice
    : quantity * unitPrice;
  const currentMrp = (selectedPackTierId === activeTier?.id && activeTier && quantity === activeTier.quantity)
    ? activeTier.mrpTotal
    : quantity * unitMrp;
  const totalSavings = currentMrp - currentPrice;
  const savingsPercent = Math.round(((currentMrp - currentPrice) / currentMrp) * 100);

  const isOutOfStock = currentProd?.stockStatus === 'outofstock' || currentProd?.stock === 0;

  const handleTierSelect = (tier) => {
    setSelectedPackTierId(tier.id);
    setQuantity(tier.quantity);
    analytics.trackQuantitySelect(currentProd, tier.quantity, tier.label);
  };

  const handleQuantityChange = (newQty) => {
    const val = Math.max(1, Math.min(200, parseInt(newQty, 10) || 1));
    setSelectedPackTierId('custom');
    setQuantity(val);
    analytics.trackQuantitySelect(currentProd, val, `Custom ${val} Units`);
  };

  const getItemPayload = () => ({
    id: `${currentProd.id}-${selectedPackTierId}-${quantity}`,
    cartItemId: `${currentProd.id}-${selectedPackTierId}-${quantity}`,
    itemKey: `${currentProd.id}-${selectedPackTierId}-${quantity}`,
    productId: currentProd.id,
    sku: currentProd.sku,
    name: currentProd.name,
    category: currentProd.category || 'Mirror Aqua',
    variant: activeTier && quantity === activeTier.quantity 
      ? activeTier.label 
      : `${quantity} ${quantity > 1 ? (isComboProduct ? 'Combos' : 'Units') : (isComboProduct ? 'Combo' : 'Unit')} (${currentProd.productType})`,
    price: Math.round(currentPrice / quantity),
    mrp: Math.round(currentMrp / quantity),
    weight: currentProd.weight || '120g',
    image: currentProd.images?.[0]?.url || '/images/product/008.jpeg'
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
    setPincodeStatus({ valid: true, message: `Dispatches in 24 hrs to ${pincode.trim()} via Pan-India Express Courier.` });
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
    <section className="product-hero-section" aria-label="Mirror Aqua Product Overview">
      {/* Top Product Switcher Navigation Banner */}
      <div className="max-w-[1400px] mx-auto px-4 pt-4 pb-2">
        <div className="bg-gradient-to-r from-slate-900 via-[#0B2545] to-slate-900 p-2 rounded-2xl border border-cyan-500/30 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 pl-2">
            <Sparkles size={16} className="text-amber-400 animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
              Select Mirror Aqua Option:
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {PRODUCTS.map((prod) => {
              const isActive = prod.id === currentProd.id;
              const isCombo = prod.id === 'ma-prod-002';
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleSwitchOption(prod)}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 scale-[1.02] border border-cyan-300'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {isCombo ? <Gift size={13} className="text-amber-300 shrink-0" /> : <Droplets size={13} className="text-cyan-300 shrink-0" />}
                  <span className="truncate">
                    {isCombo ? '5 Spun + 1 Free Spanner (₹995)' : '10" 120g Spun Filter (₹199)'}
                  </span>
                  {isCombo && (
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shrink-0">
                      FREE TOOL
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container product-hero-container">
        {/* Left / Top Column: High-Res Interactive Gallery */}
        <div className="hero-gallery-col">
          <ProductGallery
            images={currentProd?.images || []}
            productName={currentProd?.name || 'Mirror Aqua Water Filter Product'}
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

          {/* In-Hero Option Selector Tabs */}
          <div className="mb-3 p-2.5 bg-slate-900/90 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" /> Choose Option / Package:
              </span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/50">
                2 Available Options
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRODUCTS.map((prod) => {
                const isSelected = prod.id === currentProd.id;
                const isCombo = prod.id === 'ma-prod-002';
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSwitchOption(prod)}
                    className={`text-left p-2.5 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950 via-[#0B2545] to-blue-950 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    {isCombo ? (
                      <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight shadow">
                        🎁 FREE SPANNER OFFER
                      </span>
                    ) : (
                      <span className="absolute -top-2 right-2 bg-slate-700 text-cyan-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight">
                        STANDARD PACK
                      </span>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'}`}>
                        {isSelected && <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />}
                      </div>
                      <span className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {isCombo ? '5 Spun + Free Wrench' : '10" 120g Spun Filter'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pl-5.5 text-[11px]">
                      <span className="font-extrabold text-cyan-400">
                        {isCombo ? '₹995 combo' : 'From ₹199 (Save ₹350)'}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        {isCombo ? '66% OFF' : '64% - 67% OFF'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Product Title */}
          <h1 className="hero-product-title">
            {isComboProduct ? (
              <>MIRROR AQUA 5 MICRON 120G SPUN FILTER <span className="text-cyan-600 font-black">– PACK OF 5 + FREE FILTER SPANNER</span></>
            ) : (
              <>10-INCH 5-MICRON PP SPUN FILTER <span className="text-cyan-600 font-black">(120 GRAMS)</span></>
            )}
          </h1>
          <p className="hero-product-subtitle">
            {currentProd.shortDescription}
          </p>

          {/* Feature Badges */}
          <div className="hero-feature-badges">
            {isComboProduct ? (
              <>
                <span className="hero-badge badge-amber font-black">🎁 1 Free Filter Spanner / Wrench</span>
                <span className="hero-badge badge-cyan">Pack of 5 Spun Filters</span>
                <span className="hero-badge badge-cyan">120g PP Spun Filter</span>
                <span className="hero-badge badge-emerald">5 Micron Depth</span>
                <span className="hero-badge badge-slate">10-Inch Standard Size</span>
                <span className="hero-badge badge-slate">100% PP Material</span>
                <span className="hero-badge badge-slate">Made in India</span>
              </>
            ) : (
              <>
                <span className="hero-badge badge-amber font-black">⚡ 120 Grams Heavy Duty</span>
                <span className="hero-badge badge-cyan">5 Micron Depth</span>
                <span className="hero-badge badge-emerald">100% Virgin PP</span>
                <span className="hero-badge badge-slate">Universal 10-Inch Fit</span>
                <span className="hero-badge badge-slate">Made in India</span>
              </>
            )}
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
              {isComboProduct ? (
                quantity === 1 ? (
                  <>1 Value Combo (5 Spun Filters + 1 Wrench <strong>FREE</strong>) • <strong>₹995</strong> (MRP ₹2,899 • Save ₹1,904)</>
                ) : (
                  <>Combo price: <strong>₹{unitPrice} per pack</strong> for {quantity} packs ({quantity * 5} filters + {quantity} free wrenches) • Total savings: <strong>₹{totalSavings.toLocaleString('en-IN')}</strong></>
                )
              ) : (
                quantity === 1 ? (
                  <>Single 120g cartridge • <strong>₹199 / piece</strong> (MRP ₹549 • Save ₹350)</>
                ) : (
                  <>Unit price: <strong>₹{unitPrice} per piece</strong> for {quantity} units • Total savings: <strong>₹{totalSavings.toLocaleString('en-IN')}</strong></>
                )
              )}
            </p>

            {/* Live Stock Status */}
            <div className="hero-stock-indicator">
              <span className={`stock-dot ${isOutOfStock ? 'dot-red' : 'dot-green'}`} />
              <span className="stock-text">
                {isOutOfStock
                  ? 'Temporarily Out of Stock — Pre-order on WhatsApp'
                  : isComboProduct
                  ? 'In Stock (5 Filters + 1 Free Wrench Set) — Dispatches within 24 Hours'
                  : 'In Stock (120g Genuine) — Dispatches within 24 Hours'}
              </span>
            </div>
          </div>

          {/* Flexible Quantity & Pack Selector */}
          <div className="hero-pack-selector-block">
            <div className="pack-selector-header">
              <span className="pack-label-title">Select Pack Option:</span>
              <a href="#bulk-enquiry" onClick={scrollToBulk} className="bulk-link-hint">
                Need wholesale / B2B bulk quote?
              </a>
            </div>

            {/* Quick Pack Preset Cards */}
            <div className="pack-options-grid-presets">
              {currentProd.packTiers?.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  className={`pack-card-hero ${selectedPackTierId === tier.id ? 'selected' : ''}`}
                  onClick={() => handleTierSelect(tier)}
                >
                  {tier.badge && (
                    <span className="pack-badge-hero popular-badge">
                      {tier.badge}
                    </span>
                  )}
                  <div className="pack-card-top">
                    <div className="pack-radio-circle">
                      {selectedPackTierId === tier.id && <div className="pack-radio-inner" />}
                    </div>
                    <span className="pack-name-hero">{tier.label}</span>
                    <span className="pack-price-hero">₹{tier.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pack-sub-info">
                    <span>{tier.savingsPercent}% OFF • Save ₹{(tier.mrpTotal - tier.totalPrice).toLocaleString('en-IN')}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Quantity Stepper */}
            <div className="custom-qty-section">
              <div className="custom-qty-label-row">
                <span className="custom-qty-label">
                  {isComboProduct ? 'Or Enter Number of Combo Packs:' : 'Or Enter Custom Filter Quantity:'}
                </span>
                {!isComboProduct && (
                  <span className="custom-qty-hint">
                    💡 Tip: Buy 10+ to unlock <strong>₹180/pc</strong> rate
                  </span>
                )}
                {isComboProduct && (
                  <span className="custom-qty-hint">
                    💡 Tip: Order 2+ combos to get <strong>₹945/combo</strong> rate
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
                    max="200"
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
                  {isComboProduct
                    ? [1, 2, 3, 5, 10].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={`qty-chip ${quantity === preset ? 'active' : ''}`}
                          onClick={() => handleQuantityChange(preset)}
                        >
                          {preset} {preset === 1 ? 'Combo' : 'Combos'}
                        </button>
                      ))
                    : [1, 2, 5, 10, 20].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          className={`qty-chip ${quantity === preset ? 'active' : ''}`}
                          onClick={() => handleQuantityChange(preset)}
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
              <span>Fast Pan-India Dispatch</span>
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


