import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'msv_master_cart_v2';

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart from storage', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [cart]);

  // Sync across tabs and custom events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch (err) {}
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('msv_cart_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('msv_cart_updated', handleStorageChange);
    };
  }, []);

  // Derived Calculations
  const totalItemsCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const totalAmount = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const totalMrp = cart.reduce((sum, item) => {
    const itemMrp = Number(item.mrp) || (Number(item.price) * 1.5) || 0;
    return sum + (itemMrp * (Number(item.quantity) || 1));
  }, 0);
  const totalSavings = Math.max(0, totalMrp - totalAmount);

  // Add Item to Cart
  const addToCart = (item, qty = 1) => {
    const quantity = Math.max(1, Number(qty) || 1);
    const itemId = item.id || item.cartItemId || item.itemKey || `${item.productId || 'item'}_${item.variant || item.size || 'default'}_${item.price}`;
    
    const formattedItem = {
      id: itemId,
      cartItemId: itemId,
      itemKey: itemId,
      productId: item.productId || item.id || 'msv-item',
      name: item.name || item.title || 'Product',
      category: item.category || (item.name?.toLowerCase().includes('filter') ? 'Mirror Aqua' : 'Solar Accessories'),
      variant: item.variant || item.variantLabel || item.selectedPack || item.size || '',
      price: Number(item.price) || 0,
      mrp: Number(item.mrp) || (Number(item.price) > 0 ? Math.round(Number(item.price) * 1.65) : 549),
      image: item.image || item.images?.[0] || '/images/product/008.jpeg',
      weight: item.weight || (item.name?.toLowerCase().includes('filter') ? '120g' : ''),
      quantity: quantity
    };

    setCart(prev => {
      const existingIdx = prev.findIndex(i => (i.id === itemId || i.cartItemId === itemId || (i.productId === formattedItem.productId && i.variant === formattedItem.variant && i.price === formattedItem.price)));
      if (existingIdx >= 0) {
        return prev.map((it, idx) => 
          idx === existingIdx ? { ...it, quantity: it.quantity + quantity } : it
        );
      }
      return [...prev, formattedItem];
    });

    setNotification(`${formattedItem.name} added to cart!`);
    setIsCartOpen(true);
    setTimeout(() => setNotification(null), 3500);
  };

  // Remove / Delete Item from Cart (Guaranteed 100% Reliable Deletion)
  const removeFromCart = (itemId) => {
    if (!itemId) return;
    setCart(prev => prev.filter(item => {
      const matches = item.id === itemId || item.cartItemId === itemId || item.itemKey === itemId || item.productId === itemId;
      return !matches;
    }));
  };

  // Update Quantity (+ / - or direct value)
  const updateQuantity = (itemId, deltaOrValue) => {
    if (!itemId) return;
    setCart(prev => {
      return prev.map(item => {
        const matches = item.id === itemId || item.cartItemId === itemId || item.itemKey === itemId || item.productId === itemId;
        if (!matches) return item;

        let newQty;
        if (typeof deltaOrValue === 'number' && (deltaOrValue === 1 || deltaOrValue === -1)) {
          newQty = item.quantity + deltaOrValue;
        } else {
          newQty = Number(deltaOrValue);
        }

        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }).filter(Boolean);
    });
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
  };

  // Fast Buy Now Helper
  const buyNow = (item, qty = 1) => {
    const quantity = Math.max(1, Number(qty) || 1);
    const itemId = item.id || item.cartItemId || item.itemKey || `${item.productId || 'item'}_${Date.now()}`;
    const formattedItem = {
      id: itemId,
      cartItemId: itemId,
      itemKey: itemId,
      productId: item.productId || item.id || 'msv-item',
      name: item.name || item.title || 'Product',
      category: item.category || (item.name?.toLowerCase().includes('filter') ? 'Mirror Aqua' : 'Solar Accessories'),
      variant: item.variant || item.variantLabel || item.selectedPack || item.size || '',
      price: Number(item.price) || 0,
      mrp: Number(item.mrp) || 549,
      image: item.image || item.images?.[0] || '/images/product/008.jpeg',
      weight: item.weight || (item.name?.toLowerCase().includes('filter') ? '120g' : ''),
      quantity: quantity
    };

    setCheckoutData({
      items: [formattedItem],
      totalPrice: formattedItem.price * quantity
    });
    setIsCartOpen(false);
  };

  // Backward-compatible alias helpers for any aqua legacy components
  const addItem = addToCart;
  const items = cart.map(it => ({
    ...it,
    itemKey: it.id,
    unitPrice: it.price,
    lineTotal: it.price * it.quantity,
    product: {
      id: it.productId,
      name: it.name,
      price: it.price,
      mrp: it.mrp,
      images: [it.image],
      image: it.image
    }
  }));

  const cartState = {
    isValid: true,
    items,
    subtotal: totalAmount,
    discountAmount: 0,
    shippingFee: 0,
    taxAmount: 0,
    grandTotal: totalAmount,
    freeShippingRemaining: 0,
    isAPTS: true
  };

  const value = {
    cart,
    items,
    cartState,
    totalItemsCount,
    totalItemCount: totalItemsCount,
    cartItemsCount: totalItemsCount,
    totalAmount,
    totalMrp,
    totalSavings,
    isCartOpen,
    setIsCartOpen,
    notification,
    setNotification,
    checkoutData,
    setCheckoutData,
    addToCart,
    addItem,
    removeFromCart,
    updateQuantity,
    updateCartQuantity: updateQuantity,
    clearCart,
    buyNow
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
