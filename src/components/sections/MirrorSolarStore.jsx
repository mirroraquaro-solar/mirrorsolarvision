import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingCart, 
  Star, 
  Check, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  Edit3, 
  ZoomIn, 
  X, 
  Phone, 
  Send,
  Eye 
} from 'lucide-react';
import { CONFIRMED_BULK_COMBO, INDIVIDUAL_PRODUCTS, BUSINESS_CONTACT } from '../../data/bulkComboData';
import CheckoutPage from '../checkout/CheckoutPage';
import OrderSuccess from '../checkout/OrderSuccess';

export default function MirrorSolarStore({ onBackToHome }) {
  // Navigation / View state: 'store' | 'checkout' | 'success'
  const [viewMode, setViewMode] = useState('store');
  const [checkoutData, setCheckoutData] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Drain Clips State
  const [selectedDrainClipVariantIdx, setSelectedDrainClipVariantIdx] = useState(0); // 0: 3kW, 1: 4kW, 2: 5kW, 3: 10kW
  const [isCustomKwMode, setIsCustomKwMode] = useState(false);
  const [customKwInput, setCustomKwInput] = useState(6);
  const [selectedDrainClipSize, setSelectedDrainClipSize] = useState('35mm');

  // Modals & Detail
  const [activeProductDetail, setActiveProductDetail] = useState(null);
  const [activeComboMaterialModal, setActiveComboMaterialModal] = useState(null);

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotification, setCartNotification] = useState(null);

  // Bulk Combo State (Secondary Section)
  const [comboQuantity, setComboQuantity] = useState(1);
  const [isComboDetailOpen, setIsComboDetailOpen] = useState(false);
  const [isComboOrderOpen, setIsComboOrderOpen] = useState(false);
  const [comboOrderSubmitted, setComboOrderSubmitted] = useState(false);

  // Form for Bulk Combo
  const [comboFormData, setComboFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    whatsapp: '',
    district: '',
    message: ''
  });

  const drainClipsProduct = INDIVIDUAL_PRODUCTS.find(p => p.id === 'msv-drain-clips') || INDIVIDUAL_PRODUCTS[0];
  const combo = CONFIRMED_BULK_COMBO;
  const comboUnitPrice = combo.price;
  const comboTotalPrice = comboUnitPrice * comboQuantity;

  // Drain Clips Dynamic Price Calculation
  const getActiveDrainClipConfig = () => {
    if (isCustomKwMode) {
      const validKw = Math.max(1, Number(customKwInput) || 1);
      const clipsCount = validKw * 4;
      const price = clipsCount * 25; // Rs 25 per clip
      return {
        id: `custom-${validKw}kw`,
        label: `${validKw} kW Custom (${clipsCount} Clips)`,
        kw: validKw,
        clipsCount,
        price,
        unit: `${clipsCount} Clips (${validKw} kW)`
      };
    }
    return drainClipsProduct.variants[selectedDrainClipVariantIdx] || drainClipsProduct.variants[0];
  };

  const activeDrainClipConfig = getActiveDrainClipConfig();

  // Cart Calculations
  const cartTotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Handlers for Drain Clips
  const addToCartDrainClips = (buyNow = false) => {
    const config = getActiveDrainClipConfig();
    const cartItemId = `msv-drain-clips-${selectedDrainClipSize}-${config.id}`;
    const variantLabel = `${selectedDrainClipSize} • ${config.label}`;

    const newItem = {
      cartItemId,
      productId: 'msv-drain-clips',
      name: drainClipsProduct.name,
      variantLabel: variantLabel,
      price: config.price,
      image: drainClipsProduct.images[0],
      quantity: 1
    };

    if (buyNow) {
      setCheckoutData({
        items: [newItem],
        totalPrice: config.price
      });
      setViewMode('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });

    setCartNotification(`${drainClipsProduct.name} (${variantLabel}) added to cart!`);
    setTimeout(() => setCartNotification(null), 3000);
  };

  const updateCartQuantity = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutData({
      items: cart,
      totalPrice: cartTotalAmount
    });
    setIsCartOpen(false);
    setViewMode('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (orderData) => {
    setCompletedOrder(orderData);
    setCart([]);
    setViewMode('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const apDistricts = [
    'Alluri Sitharama Raju',
    'Anakapalli',
    'Ananthapuramu',
    'Annamayya',
    'Bapatla',
    'Chittoor',
    'Dr. B.R. Ambedkar Konaseema',
    'East Godavari (Rajahmundry)',
    'Eluru',
    'Guntur',
    'Kakinada',
    'Krishna (Machilipatnam)',
    'Kurnool',
    'Nandyal',
    'NTR (Vijayawada)',
    'Palnadu',
    'Parvathipuram Manyam',
    'Prakasam (Ongole)',
    'Sri Potti Sriramulu Nellore',
    'Sri Sathya Sai',
    'Srikakulam',
    'Tirupati',
    'Visakhapatnam',
    'Vizianagaram',
    'West Godavari (Bhimavaram)',
    'YSR (Kadapa)'
  ];

  // If in Checkout View
  if (viewMode === 'checkout') {
    return (
      <CheckoutPage 
        checkoutData={checkoutData} 
        onBack={() => {
          setViewMode('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  // If in Order Success View
  if (viewMode === 'success') {
    return (
      <OrderSuccess 
        orderData={completedOrder} 
        onContinueShopping={() => {
          setViewMode('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onViewOrders={() => {
          setViewMode('store');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-28 scroll-mt-20 relative" id="store">
      
      {/* Top Header / Sticky Navigation Bar */}
      <div className="bg-[#0A192F] text-white border-b border-slate-800 sticky top-[78px] lg:top-[96px] z-30 shadow-md">
        <div className="container-custom py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onBackToHome) {
                  onBackToHome();
                } else {
                  window.location.hash = '#home';
                }
              }}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer mr-2"
            >
              <ArrowLeft size={16} />
              <span>Home</span>
            </button>

            {/* Mirror Solar Store Logo Title */}
            <div className="flex items-center gap-1.5 font-heading font-black text-lg sm:text-xl tracking-tight text-white">
              <span>Mirror Solar</span>
              <span className="text-[#F58220]">Store</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cart Drawer Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 bg-[#172A45] hover:bg-[#1F3658] border border-slate-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all relative cursor-pointer"
            >
              <ShoppingCart size={16} className="text-[#F58220]" />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className="bg-[#F58220] text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center -mr-1">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <a 
              href={`tel:${BUSINESS_CONTACT.phoneRaw}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-accent-400 transition hidden sm:inline-flex"
            >
              <Phone size={14} className="text-emerald-400" />
              <span>{BUSINESS_CONTACT.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Cart Toast Notification */}
      {cartNotification && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-slate-950 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2 animate-fade-in-up">
          <Check size={16} className="text-accent-400" />
          <span>{cartNotification}</span>
        </div>
      )}

      {/* Store Catalog Heading */}
      <div className="pt-10 pb-8 text-center">
        <div className="container-custom max-w-3xl mx-auto space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-accent-600 bg-accent-500/10 px-3.5 py-1.5 rounded-full border border-accent-500/20">
            Store Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading tracking-tight">
            Store Catalog
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Genuine solar accessories, drain clips, and complete installation bulk combos with instant online checkout.
          </p>
        </div>
      </div>

      <div className="container-custom space-y-16">
        
        {/* ========================================================================= */}
        {/* SECTION 1: INDIVIDUAL PRODUCTS (MSV Heavy-Duty Drain Clips) */}
        {/* ========================================================================= */}
        <section aria-label="Individual Solar Products Catalogue" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Featured Product
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Order genuine anti-sludge drain clips directly with secure online payment & Shiprocket delivery tracking.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-full w-fit">
              1 Product Available
            </span>
          </div>

          {/* DRAIN CLIPS PRODUCT CARD */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-stretch text-left">
              
              {/* Product Image & Badges */}
              <div className="w-full md:w-5/12 space-y-3">
                <div 
                  onClick={() => setActiveProductDetail(drainClipsProduct)}
                  className="bg-slate-50 rounded-2xl p-6 aspect-square flex items-center justify-center relative overflow-hidden border border-slate-100 cursor-pointer group hover:bg-slate-100/70 transition"
                >
                  <img 
                    src={drainClipsProduct.images[0]} 
                    alt={drainClipsProduct.name} 
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-accent-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide shadow-xs">
                    {drainClipsProduct.tag}
                  </span>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-3 gap-2">
                  {drainClipsProduct.images.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setActiveProductDetail(drainClipsProduct)}
                      className="aspect-square bg-slate-50 border border-slate-200 rounded-xl p-1.5 flex items-center justify-center cursor-pointer hover:border-primary-500 transition"
                    >
                      <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Config & Actions */}
              <div className="w-full md:w-7/12 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Category & Rating */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {drainClipsProduct.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                      <span>{drainClipsProduct.rating}</span>
                      <span className="text-slate-400 text-[11px]">({drainClipsProduct.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 
                      onClick={() => setActiveProductDetail(drainClipsProduct)}
                      className="text-2xl sm:text-3xl font-extrabold text-slate-900 group-hover:text-primary-600 transition-colors font-heading cursor-pointer"
                    >
                      {drainClipsProduct.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {drainClipsProduct.fullDesc}
                    </p>
                  </div>

                  {/* Frame Thickness Selector */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Frame Thickness:
                      </label>
                      <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                        {selectedDrainClipSize} Selected
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {drainClipsProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedDrainClipSize(sz)}
                          className={`py-2 rounded-xl border text-xs font-black transition cursor-pointer text-center ${
                            selectedDrainClipSize === sz
                              ? 'bg-[#0A2540] text-white border-[#0A2540] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Solar Capacity: 3kW, 4kW, 5kW, 10kW & Manual Entry */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Solar Capacity (kW):
                      </label>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        4 Clips/kW • ₹25/clip
                      </span>
                    </div>

                    {/* Preset Options Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {drainClipsProduct.variants.map((variant, vIdx) => {
                        const isSelected = !isCustomKwMode && selectedDrainClipVariantIdx === vIdx;
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() => {
                              setIsCustomKwMode(false);
                              setSelectedDrainClipVariantIdx(vIdx);
                            }}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                              isSelected
                                ? 'bg-primary-50 border-primary-500 text-primary-900 ring-2 ring-primary-500 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-xs font-black">{variant.kw} kW</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{variant.clipsCount} Clips</span>
                            <strong className="text-sm font-extrabold text-slate-900 mt-1">₹{variant.price}</strong>
                          </button>
                        );
                      })}
                    </div>

                    {/* Manual Entry Toggle & Input */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setIsCustomKwMode(prev => !prev)}
                        className={`text-xs font-bold flex items-center gap-1 transition cursor-pointer mb-1.5 ${
                          isCustomKwMode ? 'text-[#F58220] font-black' : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Edit3 size={13} />
                        <span>{isCustomKwMode ? '✓ Custom / Manual kW Active' : '+ Or Enter Custom / Manual kW'}</span>
                      </button>

                      {isCustomKwMode && (
                        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2 animate-fade-in-up">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">Enter Capacity (kW):</span>
                            <span className="font-black text-amber-800">
                              {Number(customKwInput) || 1} kW = {(Number(customKwInput) || 1) * 4} Clips
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCustomKwInput(prev => Math.max(1, (Number(prev) || 1) - 1))}
                              className="w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-sm cursor-pointer"
                            >
                              -
                            </button>
                            
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min="1"
                                max="500"
                                value={customKwInput}
                                onChange={(e) => setCustomKwInput(e.target.value)}
                                className="w-full bg-white border border-amber-300 px-3 py-1.5 rounded-lg text-center text-sm font-black text-slate-900 focus:outline-none focus:border-accent-500"
                                placeholder="e.g. 6, 8, 12..."
                              />
                              <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold pointer-events-none">kW</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setCustomKwInput(prev => (Number(prev) || 1) + 1)}
                              className="w-9 h-9 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Price</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-950 font-heading">
                          ₹{activeDrainClipConfig.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({activeDrainClipConfig.clipsCount} Clips • {selectedDrainClipSize})
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                      In Stock • Ready to Ship
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => addToCartDrainClips(false)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => addToCartDrainClips(true)}
                      className="w-full bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Buy Now (₹{activeDrainClipConfig.price.toLocaleString('en-IN')})</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: FEATURED BULK COMBO — SECONDARY */}
        {/* ========================================================================= */}
        <section aria-label="Featured Bulk Solar Installation Combo" className="space-y-6 pt-8 border-t-2 border-slate-200/80">
          
          <div className="text-left max-w-2xl space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-accent-600 bg-accent-500/10 px-3 py-1 rounded-full uppercase tracking-wider mb-1">
              <Sparkles size={13} className="text-accent-500" />
              <span>Special Bulk Offer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Featured Bulk Combo
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Need materials in bulk? Explore our ready-to-order combo package.
            </p>
          </div>

          {/* Featured Bulk Combo Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 p-6 sm:p-10 items-center">
              
              {/* Left: 6 Materials Grid with Item Counts on Photos (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-3 shadow-xs">
                  {combo.materialsIncluded.map((mat) => (
                    <div 
                      key={mat.id}
                      onClick={() => setActiveComboMaterialModal(mat)}
                      className="bg-white rounded-xl p-2 border border-slate-200/80 hover:border-primary-500 hover:shadow-md flex flex-col items-center justify-between transition-all duration-200 cursor-pointer group relative overflow-hidden"
                      title={`Click to inspect ${mat.name} (${mat.countLabel})`}
                    >
                      <div className="w-full aspect-square flex items-center justify-center p-1 relative">
                        <img 
                          src={mat.image} 
                          alt={mat.name} 
                          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                          <ZoomIn size={16} className="text-white drop-shadow-md" />
                        </div>
                      </div>

                      <div className="w-full text-center mt-1 space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-800 block truncate leading-tight">
                          {mat.name.split(' ')[0]}
                        </span>
                        <span className="text-[10px] font-black text-primary-700 bg-primary-50 border border-primary-200/60 px-1.5 py-0.5 rounded-md block truncate">
                          {mat.countLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <ZoomIn size={13} className="text-primary-600" />
                  <span>Click any component photo to open in big size with specs</span>
                </div>
              </div>

              {/* Right: Details, Summary, Pricing & Actions (7 cols) */}
              <div className="md:col-span-7 space-y-5 text-left">
                
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-accent-500 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    BULK OFFER
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Ready for Dispatch
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    • Open to Everyone
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                    Bulk Solar Installation Combo
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                    Essential solar installation materials bundled together in one ready-to-order bulk package.
                  </p>
                </div>

                {/* Concise 6 Materials Summary */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Package Summary (Included in 1 Combo):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                    {combo.materialsIncluded.map((mat) => (
                      <div 
                        key={mat.id}
                        onClick={() => setActiveComboMaterialModal(mat)}
                        className="flex items-center gap-2 cursor-pointer hover:text-primary-600 transition"
                      >
                        <CheckCircle2 size={15} className="text-primary-600 shrink-0" />
                        <span>{mat.displayQty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Section */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Combo Price
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black text-slate-950 font-heading">
                      ₹15,000
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      per complete combo
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => setIsComboDetailOpen(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-5 rounded-xl border border-slate-200 text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye size={16} />
                    <span>VIEW COMBO</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsComboOrderOpen(true);
                      setComboOrderSubmitted(false);
                    }}
                    className="w-full bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-3.5 px-5 rounded-xl shadow-accent text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send size={15} className="fill-slate-950" />
                    <span>ORDER NOW</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: SINGLE COMBO MATERIAL BIG PHOTO & DATA MODAL */}
      {/* ========================================================================= */}
      {activeComboMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-left relative">
            
            <button 
              onClick={() => setActiveComboMaterialModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold transition cursor-pointer z-10"
            >
              <X size={18} />
            </button>

            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 aspect-video sm:aspect-[16/10] flex items-center justify-center relative overflow-hidden shadow-inner">
                <img 
                  src={activeComboMaterialModal.image} 
                  alt={activeComboMaterialModal.name} 
                  className="max-h-full max-w-full object-contain transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs font-black px-3 py-1 rounded-lg shadow-sm">
                  {activeComboMaterialModal.countLabel} Included
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-accent-600 bg-accent-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Bulk Combo Component
                  </span>
                  <span className="text-xs font-bold text-slate-400">• Part of ₹15,000 Package</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-heading">
                  {activeComboMaterialModal.name}
                </h3>
                <p className="text-sm font-extrabold text-primary-600 mt-0.5">
                  Package Quantity: {activeComboMaterialModal.displayQty}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Component Specifications & Function:
                </span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeComboMaterialModal.description}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Inspect Other Included Components:
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {combo.materialsIncluded.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveComboMaterialModal(m)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                        activeComboMaterialModal.id === m.id
                          ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <img src={m.image} alt={m.name} className="h-8 w-8 object-contain" />
                      <span className="text-[9px] font-bold text-slate-800 truncate w-full mt-1 text-center">
                        {m.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setActiveComboMaterialModal(null);
                    setIsComboOrderOpen(true);
                    setComboOrderSubmitted(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-3.5 rounded-xl shadow-accent text-xs sm:text-sm transition cursor-pointer text-center"
                >
                  ORDER BULK COMBO (₹15,000)
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK COMBO DETAILS ("VIEW COMBO") */}
      {/* ========================================================================= */}
      {isComboDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left relative">
            
            <button 
              onClick={() => setIsComboDetailOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-accent-600 block mb-1">
                  Combo Details
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                  Bulk Solar Installation Combo
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Included Materials in 1 Package:
                </p>
              </div>

              <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden">
                {combo.materialsIncluded.map((mat) => (
                  <div 
                    key={mat.id} 
                    onClick={() => {
                      setIsComboDetailOpen(false);
                      setActiveComboMaterialModal(mat);
                    }}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition cursor-pointer group"
                    title="Click to view large photo & full specifications"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <img src={mat.image} alt={mat.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <strong className="text-xs sm:text-sm font-bold text-slate-900 block group-hover:text-primary-600 transition">{mat.name}</strong>
                        <span className="text-[11px] text-slate-500">{mat.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-primary-600 bg-primary-50 border border-primary-100 px-3 py-1 rounded-lg">
                        {mat.countLabel}
                      </span>
                      <ZoomIn size={15} className="text-slate-400 group-hover:text-primary-600" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Quantity:
                  </span>
                  
                  <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => {
                        if (comboQuantity > 1) setComboQuantity(prev => prev - 1);
                      }}
                      disabled={comboQuantity <= 1}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-bold flex items-center justify-center text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-sm font-extrabold text-slate-900 px-2">{comboQuantity}</span>
                    <button
                      onClick={() => setComboQuantity(prev => prev + 1)}
                      className="w-8 h-8 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 font-bold">
                  <span className="text-slate-500">Total Combo Calculation:</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {comboQuantity} × ₹15,000 = <strong className="text-accent-600 font-black">₹{comboTotalPrice.toLocaleString('en-IN')}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setIsComboDetailOpen(false);
                    setIsComboOrderOpen(true);
                    setComboOrderSubmitted(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-3.5 rounded-xl shadow-accent text-xs sm:text-sm transition cursor-pointer text-center"
                >
                  PROCEED TO ORDER (₹{comboTotalPrice.toLocaleString('en-IN')})
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BULK COMBO ORDER FORM */}
      {/* ========================================================================= */}
      {isComboOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left relative">
            
            <button 
              onClick={() => setIsComboOrderOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold transition cursor-pointer"
            >
              <X size={18} />
            </button>

            {comboOrderSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                  ✓
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                  Bulk Order Received!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-slate-900">{comboFormData.name}</strong>. We have registered your order for <strong className="text-slate-900">{comboQuantity} × Bulk Combo (₹{comboTotalPrice.toLocaleString('en-IN')})</strong>. Our logistics manager will call you on <strong className="text-slate-900">{comboFormData.phone}</strong> to confirm dispatch details.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => {
                      setIsComboOrderOpen(false);
                      setComboOrderSubmitted(false);
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  setComboOrderSubmitted(true); 
                }} 
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-accent-600 uppercase tracking-wider block mb-1">
                    Bulk Order Placement
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 font-heading">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your delivery location details for bulk freight dispatch across Andhra Pradesh.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Quantity:</span>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (comboQuantity > 1) setComboQuantity(prev => prev - 1);
                        }}
                        disabled={comboQuantity <= 1}
                        className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-extrabold text-slate-900 px-2">{comboQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setComboQuantity(prev => prev + 1)}
                        className="w-6 h-6 rounded bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 font-bold">
                    <span className="text-slate-500">Total Calculation:</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {comboQuantity} × ₹15,000 = <strong className="text-accent-600 font-black">₹{comboTotalPrice.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={comboFormData.name}
                      onChange={(e) => setComboFormData({ ...comboFormData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={comboFormData.companyName}
                      onChange={(e) => setComboFormData({ ...comboFormData, companyName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={comboFormData.phone}
                      onChange={(e) => setComboFormData({ ...comboFormData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      placeholder="WhatsApp (if different)"
                      value={comboFormData.whatsapp}
                      onChange={(e) => setComboFormData({ ...comboFormData, whatsapp: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Delivery District *
                  </label>
                  <select
                    required
                    value={comboFormData.district}
                    onChange={(e) => setComboFormData({ ...comboFormData, district: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Select District</option>
                    {apDistricts.map((d, i) => (
                      <option key={i} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Delivery Address / Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter delivery location details..."
                    value={comboFormData.message}
                    onChange={(e) => setComboFormData({ ...comboFormData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-sm focus:outline-none focus:border-primary-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent-500 to-[#F58220] hover:opacity-95 text-slate-950 font-black py-3.5 rounded-xl text-sm transition-all shadow-accent mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={15} className="fill-slate-950" />
                  <span>SUBMIT BULK ORDER (₹{comboTotalPrice.toLocaleString('en-IN')})</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER CART DRAWER */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
          <div 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-left">
              
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-primary-600" />
                  <h3 className="text-lg font-black text-slate-900 font-heading">
                    Shopping Cart ({cartItemsCount})
                  </h3>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Items */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <ShoppingCart size={28} />
                    </div>
                    <h4 className="text-base font-bold text-slate-800">Your cart is empty</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Explore our products above and add items to your cart.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div 
                      key={item.cartItemId}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{item.name}</h5>
                        <span className="text-[10px] font-semibold text-slate-500 block">{item.variantLabel}</span>
                        <strong className="text-xs font-black text-slate-900 block mt-0.5">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateCartQuantity(item.cartItemId, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-black text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.cartItemId, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button 
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer with Direct Razorpay Checkout */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-600">Subtotal:</span>
                    <span className="text-2xl font-black text-slate-950 font-heading">
                      ₹{cartTotalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-slate-950 font-black py-3.5 rounded-xl text-sm transition shadow-md cursor-pointer flex items-center justify-center gap-2 border border-[#FCD200]"
                    >
                      <ShoppingCart size={16} />
                      <span>PROCEED TO CHECKOUT (₹{cartTotalAmount.toLocaleString('en-IN')})</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRODUCT QUICK VIEW / FULL SPECS */}
      {/* ========================================================================= */}
      {activeProductDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left relative">
            
            <button 
              onClick={() => setActiveProductDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0">
                  <img src={activeProductDetail.images[0]} alt={activeProductDetail.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-accent-600 bg-accent-50 px-2.5 py-0.5 rounded-full uppercase">
                    {activeProductDetail.category}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    {activeProductDetail.name}
                  </h3>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span>{activeProductDetail.rating}</span>
                    <span className="text-slate-400">({activeProductDetail.reviewsCount} customer reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeProductDetail.fullDesc}
              </p>

              {/* Technical Specs */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Technical Specifications:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {activeProductDetail.specs.map((spec, sidx) => (
                    <div key={sidx} className="flex items-start gap-1.5">
                      <CheckCircle2 size={13} className="text-primary-600 shrink-0 mt-0.5" />
                      <span><strong className="text-slate-800">{spec.label}:</strong> {spec.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    addToCartDrainClips(true);
                    setActiveProductDetail(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-accent-500 to-[#F58220] text-slate-950 font-black py-3 rounded-xl text-xs sm:text-sm shadow-accent cursor-pointer text-center"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => {
                    addToCartDrainClips(false);
                    setActiveProductDetail(null);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs sm:text-sm cursor-pointer text-center"
                >
                  Add to Cart
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
