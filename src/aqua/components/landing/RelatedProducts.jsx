import React from 'react';
import { Sparkles, Gift, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { PRODUCTS } from '../../data/products.js';
import { useCart } from '../../context/CartContext.jsx';
import { analytics } from '../../services/analytics.js';
import './ProductLanding.css';

export function RelatedProducts({ currentProductId, onNavigate }) {
  const { addToCart, setIsCartOpen } = useCart();
  const otherProducts = PRODUCTS.filter(p => p.id !== currentProductId);

  if (otherProducts.length === 0) return null;

  const handleQuickAdd = (e, prod) => {
    e.stopPropagation();
    const itemToAdd = {
      id: `${prod.id}-tier-1`,
      cartItemId: `${prod.id}-tier-1`,
      itemKey: `${prod.id}-tier-1`,
      productId: prod.id,
      sku: prod.sku,
      name: prod.name,
      category: prod.category || 'Mirror Aqua',
      variant: prod.packTiers?.[0]?.label || '1 Standard Unit',
      price: prod.price,
      mrp: prod.mrp,
      weight: prod.weight || '120g',
      image: prod.images?.[0]?.url || '/images/product/008.jpeg'
    };
    addToCart(itemToAdd, 1);
    analytics.trackAddToCart(itemToAdd, 1);
    if (setIsCartOpen) setIsCartOpen(true);
  };

  return (
    <section className="related-products-section py-12 bg-slate-900/40 border-t border-b border-cyan-900/40" id="related-products">
      <div className="container max-w-[1280px] mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>Mirror Aqua Product Range</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
            EXPLORE MORE SAVER PACKS & COMBOS
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Genuine 120-gram virgin polypropylene filters and replacement accessories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {otherProducts.map((prod) => {
            const isCombo = prod.id === 'ma-prod-002';
            const savings = prod.mrp - prod.price;
            const savingsPct = Math.round((savings / prod.mrp) * 100);

            return (
              <div
                key={prod.id}
                onClick={() => {
                  if (onNavigate) onNavigate(`/product/${prod.slug}`);
                }}
                className="bg-slate-950/80 hover:bg-slate-900 border border-cyan-800/40 hover:border-cyan-500/70 rounded-2xl p-5 shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              >
                {/* Top Badge */}
                {isCombo && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tight flex items-center gap-1 shadow-md">
                    <Gift size={12} className="fill-slate-950" />
                    <span>1 FREE WRENCH TOOL</span>
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-900 border border-slate-800 p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={prod.images?.[0]?.url || '/images/product/008.jpeg'}
                      alt={prod.name}
                      width="112"
                      height="112"
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider block mb-1">
                      {prod.productType}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white line-clamp-2 group-hover:text-cyan-300 transition-colors font-heading">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {prod.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Highlights Strip */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-black text-white font-heading">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 line-through">
                        MRP ₹{prod.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                        {savingsPct}% OFF
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Save ₹{savings.toLocaleString('en-IN')} off MRP
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(e, prod)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 transition cursor-pointer"
                      title="Quick Add to Cart"
                    >
                      <ShoppingBag size={16} />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                    >
                      <span>VIEW</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

