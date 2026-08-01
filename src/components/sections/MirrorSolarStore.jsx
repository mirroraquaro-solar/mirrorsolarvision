import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Star, 
  ChevronRight, 
  Plus, 
  Minus, 
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MirrorSolarStore({ initialSubView = 'catalog', onBackToHome, onCheckout }) {
  const [activeSubView, setActiveSubView] = useState(initialSubView); // 'catalog' | 'product-detail'
  const [selectedProductId, setSelectedProductId] = useState('drain-clips');
  
  // Handle external change of initialSubView if prop changes
  useEffect(() => {
    if (initialSubView === 'drain-clips') {
      setActiveSubView('product-detail');
      setSelectedProductId('drain-clips');
    } else if (initialSubView) {
      setActiveSubView(initialSubView);
    }
  }, [initialSubView]);

  // Drain clips specific state
  const drainClipImages = [
    '/assets/images/001.png',
    '/assets/images/002.png',
    '/assets/images/003.png',
    '/assets/images/004.png',
    '/assets/images/005.png',
    '/assets/images/006.png'
  ];

  const catalogProducts = [
    {
      id: 'drain-clips',
      name: 'MSV Heavy-Duty Drain Clips',
      subtitle: 'Solar Panel Dust & Water Drain Clips',
      category: 'anti-soiling',
      badge: 'Anti-Soiling Tech',
      tag: 'Best Seller',
      rating: 4.9,
      reviewsCount: 84,
      image: '/assets/images/001.png',
      images: drainClipImages,
      description: 'Boost solar panel output by up to 15% by eliminating stagnant water and dirty mud bands along the bottom frame. Made from high-grade UV-resistant polymers tested for extreme Indian summers & heavy rains. Easy snap-on installation.',
      startingPrice: 300, // For 3kW default (12 clips * 25)
      unitText: 'for 3kW Plant',
      inStock: true,
      featured: true,
    },
    {
      id: 'cleaning-liquid',
      name: 'MSV Premium Solar Panel Cleaning Liquid',
      subtitle: 'Anti-Static High-Efficiency Wash',
      category: 'cleaning',
      badge: 'Panel Care',
      tag: 'New',
      rating: 4.9,
      reviewsCount: 24,
      image: '/assets/images/products/s1.jpeg',
      images: [
        '/assets/images/products/s1.jpeg',
        '/assets/images/products/s2.jpeg',
        '/assets/images/products/s3.jpeg',
        '/assets/images/products/s4.jpeg'
      ],
      description: 'Specially formulated solar panel cleaning liquid that removes stubborn dust, bird droppings, and leaves an anti-static coating to keep panels clean longer. Safe on anti-reflective coatings.',
      startingPrice: 1500,
      unitText: 'per 1L bottle',
      inStock: true,
      featured: true,
    },
    {
      id: 'test-pen',
      name: 'Test Product (Pen)',
      subtitle: 'For Payment Testing',
      category: 'testing',
      badge: 'Test',
      tag: 'Demo',
      rating: 5.0,
      reviewsCount: 1,
      image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=400',
      images: [
        'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&q=80&w=400'
      ],
      description: 'This is a test product created specifically to verify the Razorpay and Shiprocket integration flows. It is priced at exactly ₹20.',
      startingPrice: 20,
      unitText: 'per pen',
      inStock: true,
      featured: true,
    },
  ];

  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('35mm');
  const [selectedKw, setSelectedKw] = useState(3); // Default 3kW
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  
  const { requireAuth, userProfile, updateCart } = useAuth();
  const [localCartCount, setLocalCartCount] = useState(0);

  useEffect(() => {
    if (userProfile && userProfile.cartCount !== undefined) {
      setLocalCartCount(userProfile.cartCount);
    } else if (!userProfile) {
      setLocalCartCount(0);
    }
  }, [userProfile]);
  
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: '',
    district: '',
    mandal: ''
  });

  const activeProduct = catalogProducts.find(p => p.id === selectedProductId) || catalogProducts[0];
  
  // Set initial image when product changes
  useEffect(() => {
    const product = catalogProducts.find(p => p.id === selectedProductId) || catalogProducts[0];
    setActiveImage(product.images[0]);
    setQuantity(1);
  }, [selectedProductId]);

  // Price calculations
  // Drain clips: kW * 4 clips * ₹25/clip
  const currentPrice = activeProduct.id === 'drain-clips' ? (selectedKw * 4 * 25) : activeProduct.startingPrice;
  const totalPrice = currentPrice * quantity;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setOrderSubmitted(true);
  };

  const [toastMessage, setToastMessage] = useState('');

  const handleAddToCart = () => {
    requireAuth(() => {
      const newCount = localCartCount + quantity;
      setLocalCartCount(newCount);
      updateCart(newCount);
      setToastMessage(`Added ${quantity} ${activeProduct.name} to your cart.`);
      setTimeout(() => setToastMessage(''), 3000);
    }, 'Sign in to save this product to your cart.');
  };

  const handleBuyNow = () => {
    requireAuth(() => {
      if (onCheckout) {
        onCheckout({
          item: {
             ...activeProduct,
             quantity,
             selectedSize,
             selectedKw
          },
          totalPrice
        });
      }
    }, 'Sign in to securely checkout your order.');
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20 scroll-mt-20 text-slate-900" id="store" aria-label="Mirror Solar Store">
      
      {/* Top Banner Header - Clean Version */}
      <div className="bg-slate-900 text-white pt-6 pb-6 border-b border-slate-800">
        <div className="container-custom">
          {/* Breadcrumb / Top Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                if (activeSubView === 'product-detail') {
                  setActiveSubView('catalog');
                } else if (onBackToHome) {
                  onBackToHome();
                } else {
                  window.location.hash = '#home';
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
              {activeSubView === 'product-detail' ? 'Back to All Products' : 'Back to Home'}
            </button>

            <div className="flex items-center gap-6">
              <h1 className="text-xl md:text-2xl font-extrabold font-heading hidden sm:block">
                Mirror Solar <span className="text-accent-500">Store</span>
              </h1>
              <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition">
                <ShoppingCart size={18} className="text-accent-400" />
                <span className="font-bold text-sm">Cart</span>
                {localCartCount > 0 && (
                  <span className="bg-accent-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                    {localCartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Store Area */}
      <div className="container-custom pt-8">
        
        {/* SUBVIEW 1: STORE CATALOG (CLEAN GRID) */}
        {activeSubView === 'catalog' && (
          <div className="animate-fade-in-up space-y-6">
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="text-primary-500" size={24} />
              Store Catalog
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {catalogProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setSelectedProductId(product.id);
                    setActiveSubView('product-detail');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
                >
                  <div className="p-5">
                    {/* Image Container */}
                    <div className="relative bg-slate-50 border border-slate-100 rounded-xl p-4 aspect-square flex items-center justify-center overflow-hidden mb-4 group-hover:bg-primary-50/20 transition-colors">
                      <span className="absolute top-3 left-3 bg-accent-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10 shadow-sm">
                        {product.tag}
                      </span>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply" 
                      />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-slate-400 text-[11px] font-normal">({product.reviewsCount} reviews)</span>
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-primary-500 transition-colors leading-snug">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Footer / Price */}
                  <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50 mt-auto">
                    <div className="flex items-baseline justify-between py-3">
                      <div>
                        <span className="text-lg font-extrabold text-slate-950">₹{product.startingPrice.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-500 block">{product.unitText}</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        In Stock
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBVIEW 2: GENERIC PRODUCT DETAIL PAGE (AMAZON STYLE) */}
        {activeSubView === 'product-detail' && (
          <div className="animate-fade-in-up space-y-4">
            
            {/* Breadcrumb */}
            <div className="text-sm text-slate-500 flex items-center gap-2 mb-4">
              <button onClick={() => setActiveSubView('catalog')} className="hover:text-primary-600 hover:underline">
                Store
              </button>
              <ChevronRight size={14} />
              <span>{activeProduct.category}</span>
              <ChevronRight size={14} />
              <span className="font-bold text-slate-800">{activeProduct.name}</span>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* 1. Left Column: Image Gallery (col-span-4) */}
                <div className="lg:col-span-5 flex flex-col-reverse lg:flex-row gap-4">
                  {/* Thumbnails (Vertical on desktop, horizontal on mobile) */}
                  <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                    {activeProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        onMouseEnter={() => setActiveImage(img)}
                        onClick={() => setActiveImage(img)}
                        className={`w-16 h-16 shrink-0 border-[2px] rounded-lg overflow-hidden flex items-center justify-center p-1 bg-white hover:border-primary-500 transition-all ${
                          activeImage === img ? 'border-primary-500 shadow-sm' : 'border-slate-200'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                      </button>
                    ))}
                  </div>
                  {/* Main Image */}
                  <div className="flex-1 bg-white border border-slate-100 rounded-2xl flex items-center justify-center aspect-square md:aspect-auto md:min-h-[450px] p-6 shadow-inner">
                    <img 
                      src={activeImage} 
                      alt={activeProduct.name} 
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />
                  </div>
                </div>

                {/* 2. Middle Column: Product Details (col-span-4) */}
                <div className="lg:col-span-4 space-y-4 text-left">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                    {activeProduct.name}
                  </h1>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.floor(activeProduct.rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                      ))}
                      <span className="text-sm font-bold text-slate-700 ml-1">{activeProduct.rating}</span>
                    </div>
                    <a href="#" className="text-sm text-primary-600 hover:underline hover:text-primary-800">
                      {activeProduct.reviewsCount} ratings
                    </a>
                  </div>

                  <hr className="border-slate-200" />

                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-slate-500 line-through">₹{(currentPrice * 1.5).toLocaleString('en-IN')}</span>
                      <span className="text-3xl font-normal text-slate-900">
                        <span className="text-lg align-top relative top-1 pr-1">₹</span>
                        {currentPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Inclusive of all taxes</p>
                  </div>

                  {/* Dynamic Product Options based on ID */}
                  {activeProduct.id === 'drain-clips' && (
                    <div className="space-y-4 mt-6">
                      {/* Size */}
                      <div>
                        <span className="block text-sm font-bold text-slate-900 mb-2">Size: <span className="font-normal">{selectedSize}</span></span>
                        <div className="flex flex-wrap gap-2">
                          {['30mm', '35mm', '40mm'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-1.5 rounded-md border text-sm transition-all ${
                                selectedSize === size 
                                  ? 'border-orange-500 bg-orange-50/50 shadow-inner' 
                                  : 'border-slate-300 bg-white hover:bg-slate-50'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Plant Capacity (kW) Selector */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                        <span className="block text-sm font-bold text-slate-900 mb-1">Plant Capacity (kW)</span>
                        <p className="text-xs text-slate-500 mb-3">Adjust your solar plant capacity. We provide 4 clips per kW automatically.</p>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center border-[2px] border-slate-300 rounded-lg bg-white h-10 overflow-hidden">
                            <button
                              onClick={() => setSelectedKw(prev => Math.max(1, prev - 1))}
                              className="px-4 text-slate-600 hover:bg-slate-100 transition-colors h-full flex items-center justify-center font-bold"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 text-base font-bold text-slate-900 min-w-[70px] text-center border-x border-slate-200 h-full flex items-center justify-center">
                              {selectedKw} kW
                            </span>
                            <button
                              onClick={() => setSelectedKw(prev => prev + 1)}
                              className="px-4 text-slate-600 hover:bg-slate-100 transition-colors h-full flex items-center justify-center font-bold"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100">
                            {selectedKw * 4} Clips Included (₹25/clip)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <hr className="border-slate-200 mt-6" />
                  
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2 text-base">About this item</h3>
                    <ul className="list-disc list-inside text-sm text-slate-700 space-y-2 leading-relaxed">
                      {activeProduct.description.split('. ').map((point, idx) => point && (
                        <li key={idx}>{point.replace(/\.$/, '')}.</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3. Right Column: Buy Box (col-span-3) */}
                <div className="lg:col-span-3">
                  <div className="border border-slate-200 rounded-xl p-5 shadow-sm text-left sticky top-24">
                    <span className="text-xl font-normal text-slate-900 block mb-2">
                      <span className="text-sm align-top relative top-1 pr-0.5">₹</span>
                      {totalPrice.toLocaleString('en-IN')}
                    </span>
                    
                    <div className="text-sm text-slate-600 mb-4">
                      <span className="text-emerald-600 font-bold block mb-1">In Stock</span>
                      Ships from and sold by Mirror Solar Vision.
                    </div>

                    {/* Generic Quantity Selector (+/-) */}
                    <div className="mb-6">
                      <label className="text-sm font-bold text-slate-700 block mb-2">Item Quantity:</label>
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white h-10 w-fit overflow-hidden shadow-sm">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="px-4 text-slate-600 hover:bg-slate-100 transition-colors h-full flex items-center justify-center"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-bold text-slate-900 w-12 text-center border-x border-slate-200 h-full flex items-center justify-center bg-slate-50">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="px-4 text-slate-600 hover:bg-slate-100 transition-colors h-full flex items-center justify-center"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200] font-normal py-2 rounded-full text-sm shadow-sm transition-colors flex justify-center"
                      >
                        Add to Cart
                      </button>
                      
                      <button
                        onClick={handleBuyNow}
                        className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-slate-900 border border-[#FF8F00] font-normal py-2 rounded-full text-sm shadow-sm transition-colors flex justify-center"
                      >
                        Buy Now
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 justify-center">
                      <ShieldCheck size={14} /> Secure transaction
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>

      {/* E-commerce Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto relative animate-fade-in-up border border-slate-100">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-accent-400" />
                <span className="font-heading font-bold text-base">Checkout Order Details</span>
              </div>
              <button 
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderSubmitted(false);
                }} 
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {orderSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <span className="text-5xl block animate-bounce">🎉</span>
                <h4 className="text-xl font-bold text-slate-900">Order Placed Successfully!</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Thank you for your order from Mirror Solar Store. We will reach out to you via call or WhatsApp within a few hours to arrange payment & dispatch your {activeProduct.name}.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs text-slate-600 space-y-1 mt-4">
                  <p><strong>Item:</strong> {activeProduct.name} {activeProduct.id === 'drain-clips' ? `(${selectedSize})` : ''}</p>
                  <p><strong>Configuration:</strong> {activeProduct.id === 'drain-clips' ? `${selectedKw}kW Plant (${selectedKw * 4} Clips)` : `Standard`}</p>
                  <p><strong>Quantity:</strong> {quantity}</p>
                  <p><strong>Total Amount:</strong> ₹{totalPrice.toLocaleString('en-IN')}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setOrderSubmitted(false);
                  }}
                  className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-slate-900 border border-[#FF8F00] font-bold py-3 rounded-xl transition-colors mt-6"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4 text-left">
                {/* Product Summary Mini Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{activeProduct.name} {activeProduct.id === 'drain-clips' ? `(${selectedSize})` : ''}</p>
                    <p className="text-slate-500 mt-0.5">
                      {activeProduct.id === 'drain-clips' ? `${selectedKw}kW Plant (${selectedKw * 4} clips)` : 'Standard Size'} &times; {quantity} Qty
                    </p>
                  </div>
                  <strong className="text-slate-900 font-extrabold text-sm">₹{totalPrice.toLocaleString('en-IN')}</strong>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 shadow-sm"
                    placeholder="Enter your name"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mobile Number (WhatsApp Preferred)</label>
                  <input 
                    type="tel" 
                    required 
                    className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 shadow-sm"
                    placeholder="e.g. 9876543210"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">District (AP)</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 shadow-sm"
                      placeholder="e.g. East Godavari"
                      value={checkoutForm.district}
                      onChange={(e) => setCheckoutForm({...checkoutForm, district: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Mandal / Town</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 shadow-sm"
                      placeholder="e.g. Rajahmundry"
                      value={checkoutForm.mandal}
                      onChange={(e) => setCheckoutForm({...checkoutForm, mandal: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Delivery Address</label>
                  <textarea 
                    required 
                    rows="2"
                    className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 shadow-sm"
                    placeholder="Complete delivery address"
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#FFA41C] hover:bg-[#FA8900] text-slate-900 border border-[#FF8F00] font-bold py-3.5 rounded-xl transition-all shadow-sm text-sm mt-4"
                >
                  Place Order (Cash on Delivery / UPI)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[9999] animate-fade-in-up">
          <div className="bg-emerald-500 rounded-full p-1">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="ml-2 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}
