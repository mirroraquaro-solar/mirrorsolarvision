import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../checkout/CartDrawer';
export default function Layout({ children, onNavigate }) {
  return (
    <div className="flex flex-col min-h-screen">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-[#0A2540] focus:text-white focus:rounded-xl focus:shadow-2xl focus:border focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-black uppercase tracking-wider"
      >
        Skip to main content
      </a>
      <Header onNavigate={onNavigate} />
      <main id="main-content" className="flex-1 pt-[80px] sm:pt-[90px]" role="main">
        {children}
      </main>
      <Footer onNavigate={onNavigate} />
      <CartDrawer 
        onNavigate={onNavigate}
        onProceedToCheckout={() => onNavigate('store', 'checkout')}
      />
    </div>
  );
}
