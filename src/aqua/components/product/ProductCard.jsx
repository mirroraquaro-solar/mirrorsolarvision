import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Gift, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useUI } from '../../context/UIContext.jsx';
import './ProductCard.css';

export function ProductCard({ product, onNavigate }) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { openQuickView } = useUI();

  const isFavorited = isInWishlist(product.id);
  const primaryImg = product.images?.[0]?.url;
  const secondaryImg = product.images?.[1]?.url || primaryImg;
  const isCombo = product.id === 'ma-prod-002' || product.slug?.includes('free-wrench');

  const handleCardClick = (e) => {
    // Avoid triggering navigation if clicked on interactive buttons
    if (e.target.closest('button')) return;
    if (onNavigate) {
      onNavigate(`/product/${product.slug}`);
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const itemToAdd = {
      id: `${product.id}-tier-1`,
      cartItemId: `${product.id}-tier-1`,
      itemKey: `${product.id}-tier-1`,
      productId: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category || 'Mirror Aqua',
      variant: product.packTiers?.[0]?.label || '1 Standard Unit',
      price: product.price,
      mrp: product.mrp,
      weight: product.weight || '120g',
      image: product.images?.[0]?.url || '/images/product/008.jpeg'
    };
    addToCart(itemToAdd, 1);
    if (setIsCartOpen) setIsCartOpen(true);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="product-card-image-wrap">
        <img
          src={isHovered ? secondaryImg : primaryImg}
          alt={product.images?.[0]?.altText || product.name}
          className="product-card-image"
          loading="lazy"
        />

        {/* Badges Container */}
        <div className="product-card-badges">
          {isCombo ? (
            <span className="badge badge-editors-pick flex items-center gap-1 font-black">
              <Gift size={12} /> 1 WRENCH FREE
            </span>
          ) : (
            <span className="badge badge-handmade font-bold">
              ⚡ 120g Heavy Duty
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className={`product-card-wishlist-btn ${isFavorited ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isFavorited ? 'var(--accent-terracotta)' : 'none'} color={isFavorited ? 'var(--accent-terracotta)' : 'var(--text-primary)'} />
        </button>

        {/* Hover Action Bar */}
        <div className="product-card-actions">
          <button
            className="action-btn"
            onClick={(e) => {
              e.stopPropagation();
              openQuickView(product);
            }}
            title="Quick View"
          >
            <Eye size={15} />
            <span>Quick View</span>
          </button>
          <button
            className="action-btn action-btn-primary"
            onClick={handleQuickAdd}
            title="Add to Cart"
          >
            <ShoppingBag size={15} />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="product-card-info">
        <span className="product-card-origin">
          {product.brand || 'Mirror Aqua'} • 100% Virgin PP
        </span>
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-descriptor">{product.shortDescription}</p>

        <div className="product-card-bottom">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-white font-heading">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-slate-400 line-through">
                MRP ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
            <span>★ 4.9</span>
            <span className="text-slate-400 font-normal">({product.id === 'ma-prod-002' ? '190+' : '340+'})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

