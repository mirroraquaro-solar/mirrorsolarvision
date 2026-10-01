import React, { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles, Check, X, Gift, Droplets } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/products.js';
import { ProductCard } from '../components/product/ProductCard.jsx';
import { Button } from '../components/ui/Primitives.jsx';
import { analytics } from '../services/analytics.js';
import './ShopPage.css';

export function ShopPage({ initialFilter = null, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState(initialFilter || 'all'); // 'all' | 'combos' | 'single'
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price-low' | 'price-high' | 'name'

  useEffect(() => {
    if (initialFilter) setFilterType(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    analytics.trackViewItemList(selectedCategory, PRODUCTS.length);
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];

    // Category / Filter Type
    if (selectedCategory === 'combos' || filterType === 'combos') {
      list = list.filter(p => p.id === 'ma-prod-002' || p.slug.includes('free-wrench'));
    } else if (selectedCategory === 'spun-filters' || filterType === 'spun-filters') {
      list = list.filter(p => p.id === 'ma-prod-001');
    }

    // Sorting
    if (sortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [selectedCategory, filterType, sortBy]);

  return (
    <div className="shop-page-wrapper">
      {/* Shop Header Banner */}
      <div className="shop-header-banner">
        <div className="container">
          <span className="section-eyebrow">Mirror Aqua Water Purification</span>
          <h1 className="shop-title">GENUINE PP PRE-FILTERS & COMBOS</h1>
          <p className="shop-subtitle">
            Heavy 120-gram 100% pure melt-blown virgin polypropylene pre-filter cartridges and universal servicing tools for domestic & commercial water purifiers.
          </p>
        </div>
      </div>

      <div className="container shop-main-container">
        {/* Curated Collection Filter Pills */}
        <div className="discovery-pills-bar">
          <button
            className={`pill-btn ${filterType === 'all' && selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => { setFilterType('all'); setSelectedCategory('all'); }}
          >
            All Products ({PRODUCTS.length})
          </button>
          <button
            className={`pill-btn ${filterType === 'combos' || selectedCategory === 'combos' ? 'active' : ''}`}
            onClick={() => { setFilterType('combos'); setSelectedCategory('combos'); }}
          >
            🎁 Combos & Free Tool Offers
          </button>
          <button
            className={`pill-btn ${filterType === 'spun-filters' || selectedCategory === 'spun-filters' ? 'active' : ''}`}
            onClick={() => { setFilterType('spun-filters'); setSelectedCategory('spun-filters'); }}
          >
            ⚡ 10" PP Spun Filters (120g)
          </button>
        </div>

        {/* Toolbar: Category dropdown, Sort, Count & Filter Toggle */}
        <div className="shop-toolbar">
          <div className="toolbar-left">
            <span className="product-count-text">
              Showing <strong>{filteredProducts.length}</strong> products
            </span>
          </div>

          <div className="toolbar-right">
            {/* Category Filter */}
            <div className="select-wrap">
              <label htmlFor="category-select" className="sr-only">Category</label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setFilterType(e.target.value);
                }}
                className="shop-select"
              >
                <option value="all">All Products</option>
                <option value="combos">Combos & Free Gift Packs</option>
                <option value="spun-filters">PP Spun Filters (120g)</option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="select-wrap">
              <label htmlFor="sort-select" className="sr-only">Sort By</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="shop-select"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {filteredProducts.length > 0 ? (
          <div className="shop-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Sparkles size={48} className="empty-state-icon" />
            <h3 className="empty-state-title">Nothing here yet</h3>
            <p className="empty-state-text">
              We couldn't find items matching your current filter selection. Discover our latest finds.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedCategory('all');
                setFilterType('all');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

