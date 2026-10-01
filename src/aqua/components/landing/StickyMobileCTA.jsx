import React from 'react';
import { Zap, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { analytics } from '../../services/analytics.js';
import './ProductLanding.css';

export function StickyMobileCTA({ product, onNavigate }) {
  const { addToCart, addItem, setIsCartOpen } = useCart();

  const basePrice = product?.price || 199;
  const isOutOfStock = product?.stockStatus === 'outofstock' || product?.stock === 0;
  const isCombo = product?.id === 'ma-prod-002' || product?.slug?.includes('free-wrench');

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const addFn = addToCart || addItem;
    const itemToAdd = {
      ...product,
      id: `${product?.id || 'ma-prod-001'}-tier-1`,
      cartItemId: `${product?.id || 'ma-prod-001'}-tier-1`,
      price: basePrice,
      mrp: product?.mrp || 549,
      weight: product?.weight || '120g',
      category: product?.category || 'Mirror Aqua',
      sku: product?.sku || 'MA-PP-10-05M',
      name: product?.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter (120g)',
      variant: product?.packTiers?.[0]?.label || (isCombo ? '1 Combo (5 Filters + 1 Free Wrench)' : '1 Piece (120g Standard)'),
      image: product?.images?.[0]?.url || '/images/product/008.jpeg'
    };
    if (typeof addFn === 'function') {
      addFn(itemToAdd, 1);
    }
    analytics.trackBuyNow(itemToAdd, 1);
    if (typeof onNavigate === 'function') {
      onNavigate('store', 'checkout');
    } else {
      window.location.hash = '#store';
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const addFn = addToCart || addItem;
    const itemToAdd = {
      ...product,
      id: `${product?.id || 'ma-prod-001'}-tier-1`,
      cartItemId: `${product?.id || 'ma-prod-001'}-tier-1`,
      price: basePrice,
      mrp: product?.mrp || 549,
      weight: product?.weight || '120g',
      category: product?.category || 'Mirror Aqua',
      sku: product?.sku || 'MA-PP-10-05M',
      name: product?.name || 'Mirror Aqua 10-Inch 5-Micron PP Spun Filter (120g)',
      variant: product?.packTiers?.[0]?.label || (isCombo ? '1 Combo (5 Filters + 1 Free Wrench)' : '1 Piece (120g Standard)'),
      image: product?.images?.[0]?.url || '/images/product/008.jpeg'
    };
    if (typeof addFn === 'function') {
      addFn(itemToAdd, 1);
    }
    analytics.trackAddToCart(itemToAdd, 1);
    if (setIsCartOpen) setIsCartOpen(true);
  };

  return (
    <aside className="sticky-mobile-cta-bar" aria-label="Quick Purchase Actions">
      <div className="sticky-mobile-inner">
        <div className="sticky-price-info">
          <span className="sticky-label truncate max-w-[140px] sm:max-w-none">
            {isCombo ? '5 Filters + 1 Free Wrench' : 'Mirror Aqua 10" PP Filter'}
          </span>
          <div className="sticky-price-row">
            <span className="sticky-price">₹{basePrice.toLocaleString('en-IN')}</span>
            {product?.mrp > basePrice && (
              <span className="sticky-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>

        <div className="sticky-buttons-group">
          <button
            type="button"
            className="sticky-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Add to Cart"
          >
            <ShoppingBag size={18} />
            <span>Add</span>
          </button>

          <button
            type="button"
            className="sticky-buy-btn"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            aria-label="Buy Now"
          >
            <Zap size={18} />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

