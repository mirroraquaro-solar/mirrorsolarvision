import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, ArrowRight, Truck, Sparkles, Sun, Droplets } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer({ onProceedToCheckout, onNavigate }) {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    totalItemsCount,
    totalAmount,
    totalMrp,
    totalSavings,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  // Prevent background scroll when cart drawer is open on mobile
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (typeof onProceedToCheckout === 'function') {
      onProceedToCheckout();
    } else if (typeof onNavigate === 'function') {
      onNavigate('store', 'checkout');
    } else {
      window.location.hash = '#store';
    }
  };

  const handleShopNavigation = (target) => {
    setIsCartOpen(false);
    if (typeof onNavigate === 'function') {
      onNavigate(target);
    } else {
      window.location.hash = target === 'aqua-store' ? '#aqua-store' : '#store';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-500/20 text-accent-400 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-heading font-black text-base sm:text-lg text-white leading-tight">
                Master Cart
              </h2>
              <p className="text-[11px] text-slate-400">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors font-semibold px-2 py-1 rounded cursor-pointer"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Free Shipping Strip */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-xs font-bold text-emerald-800">
          <Truck size={15} className="text-emerald-600 shrink-0" />
          <span>Free Standard Delivery with live Shiprocket tracking</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">Your Cart is Empty</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Discover genuine solar drain clips, installation combos, and 120g PP spun filters.
                </p>
              </div>

              <div className="flex flex-col w-full gap-2 pt-2">
                <button
                  onClick={() => handleShopNavigation('store')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#0F3460] text-white text-xs font-bold py-3 rounded-xl shadow transition-all cursor-pointer"
                >
                  <Sun size={14} className="text-accent-400" />
                  <span>Browse Solar Products</span>
                </button>
                <button
                  onClick={() => handleShopNavigation('aqua-store')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-3 rounded-xl shadow transition-all cursor-pointer"
                >
                  <Droplets size={14} className="text-cyan-200" />
                  <span>Browse Mirror Aqua Products</span>
                </button>
              </div>
            </div>
          ) : (
            cart.map((item) => {
              const isAqua = item.category?.toLowerCase().includes('aqua') || item.name?.toLowerCase().includes('filter');
              const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-sm hover:border-slate-300 transition-all flex gap-3.5 relative"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center">
                    <img 
                      src={item.image || '/images/product/008.jpeg'} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.currentTarget.src = isAqua ? '/images/product/008.jpeg' : '/assets/images/products/drain-clip-front.png';
                      }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Category Badge & Delete Button */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                          isAqua ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {isAqua ? <Droplets size={10} /> : <Sun size={10} />}
                          <span>{item.category || (isAqua ? 'Mirror Aqua' : 'Solar')}</span>
                        </span>

                        {/* DELETE / REMOVE BUTTON */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.id || item.cartItemId || item.itemKey || item.productId);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          aria-label={`Remove ${item.name} from cart`}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Product Name */}
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 leading-tight">
                        {item.name}
                      </h4>

                      {/* Variant / Weight */}
                      {(item.variant || item.weight) && (
                        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {item.variant} {item.weight && !item.variant?.includes(item.weight) ? `• ${item.weight}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Stepper */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-sm sm:text-base text-slate-900 font-heading">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </span>
                          {item.mrp && Number(item.mrp) > Number(item.price) && (
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{(Number(item.mrp) * Number(item.quantity)).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-400">
                            (₹{Number(item.price).toLocaleString('en-IN')} each)
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center bg-slate-100 rounded-lg border border-slate-200/80 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id || item.cartItemId || item.itemKey || item.productId, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id || item.cartItemId || item.itemKey || item.productId, 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 space-y-3">
            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Total Savings</span>
                  <span>-₹{totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Shipping (All India)</span>
                <span className="text-emerald-600 font-bold uppercase text-[11px]">FREE</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-primary-700 font-heading">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg hover:shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            {/* Security Assurance */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>100% Secure Razorpay</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck size={13} className="text-blue-600" />
                <span>Shiprocket Logistics</span>
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
