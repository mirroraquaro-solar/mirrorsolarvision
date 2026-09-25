import React, { useState } from 'react';
import { ArrowLeft, Sun, Droplets, ShoppingBag, Truck, Search, Heart } from 'lucide-react';
import { UIProvider, useUI } from '../../aqua/context/UIContext.jsx';
import { WishlistProvider, useWishlist } from '../../aqua/context/WishlistContext.jsx';
import { CartProvider, useCart } from '../../aqua/context/CartContext.jsx';

import { ProductLandingPage } from '../../aqua/components/landing/ProductLandingPage.jsx';
import { ShopPage } from '../../aqua/pages/ShopPage.jsx';
import { CartPage } from '../../aqua/pages/CartPage.jsx';
import { CheckoutPage } from '../../aqua/pages/CheckoutPage.jsx';
import { VideoTutorialPage } from '../../aqua/pages/VideoTutorialPage.jsx';
import { TrackOrderPage } from '../../aqua/pages/TrackOrderPage.jsx';
import { AccountPage } from '../../aqua/pages/AccountPage.jsx';
import { FAQPage, ShippingInfoPage, LegalPage } from '../../aqua/pages/StaticPages.jsx';

import { CartDrawer } from '../../aqua/components/drawers/CartDrawer.jsx';
import { WishlistDrawer } from '../../aqua/components/drawers/WishlistDrawer.jsx';
import { SearchDrawer } from '../../aqua/components/drawers/SearchDrawer.jsx';
import { MobileNavDrawer } from '../../aqua/components/drawers/MobileNavDrawer.jsx';
import { QuickViewModal } from '../../aqua/components/modals/QuickViewModal.jsx';
import { WhatsAppBotButton } from '../../aqua/components/ui/WhatsAppBotButton.jsx';
import '../../aqua/styles/tokens.css';

function AquaStoreContent({ onBackToHome, onNavigate, initialPath = '/' }) {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const { setIsCartOpen, totalItemCount } = useCart();
  const { setIsWishlistOpen, wishlistCount } = useWishlist();
  const { setIsSearchOpen, setIsNavOpen } = useUI();

  const handleNavigatePath = (path) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    if (currentPath === '/' || currentPath === '' || currentPath.startsWith('/product/')) {
      const slug = currentPath.startsWith('/product/')
        ? currentPath.replace('/product/', '').split('?')[0].replace(/\/$/, '')
        : '10-inch-5-micron-pp-spun-filter';
      return <ProductLandingPage slug={slug || '10-inch-5-micron-pp-spun-filter'} onNavigate={handleNavigatePath} />;
    }

    if (currentPath === '/shop' || currentPath === '/catalog') {
      return <ShopPage onNavigate={handleNavigatePath} />;
    }

    if (currentPath === '/how-to-change-spun-filter' || currentPath === '/installation-guide' || currentPath === '/video-tutorial') {
      return <VideoTutorialPage onNavigate={handleNavigatePath} />;
    }

    if (currentPath === '/cart') {
      return <CartPage onNavigate={handleNavigatePath} />;
    }

    if (currentPath === '/checkout') {
      return <CheckoutPage onNavigate={handleNavigatePath} />;
    }

    if (currentPath === '/track' || currentPath === '/track-order') {
      return <TrackOrderPage onNavigate={handleNavigatePath} />;
    }

    if (currentPath === '/my-account') {
      return <AccountPage onNavigate={handleNavigatePath} />;
    }

    if (currentPath === '/faq') {
      return <FAQPage />;
    }

    if (currentPath === '/shipping') {
      return <ShippingInfoPage />;
    }

    if (currentPath === '/returns') {
      return (
        <LegalPage
          title="REPLACEMENT & COMPATIBILITY GUARANTEE"
          content="Mirror Aqua provides a direct replacement guarantee if any spare part arrives damaged or does not fit your compatible 10-inch pre-filter bowl. Contact our technical support on WhatsApp within 7 days of delivery for immediate dispatch of replacement."
        />
      );
    }

    if (currentPath === '/privacy-policy') {
      return (
        <LegalPage
          title="PRIVACY POLICY"
          content="Mirror Aqua respects customer and dealer privacy. Phone numbers, addresses, and inquiry details are strictly used for logistics delivery, technical verification, and commercial trade quotes. We never share customer records with third-party advertisers."
        />
      );
    }

    if (currentPath === '/terms') {
      return (
        <LegalPage
          title="TERMS & CONDITIONS"
          content="All Mirror Aqua products are sold under official trade specifications. Customers must verify bowl dimensions and follow purifier manufacturer operating instructions. All trade disputes are governed under applicable Indian jurisdiction."
        />
      );
    }

    return <ProductLandingPage slug="10-inch-5-micron-pp-spun-filter" onNavigate={handleNavigatePath} />;
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-20 relative" id="aqua-store">
      {/* Top Sticky Header with Store Switcher Bar */}
      <div className="bg-[#07172A] text-white border-b border-cyan-900/50 sticky top-[72px] sm:top-[78px] z-30 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-3.5 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Home & Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (onBackToHome) {
                  onBackToHome();
                } else if (onNavigate) {
                  onNavigate('home');
                } else {
                  window.location.hash = '#home';
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft size={16} />
              <span>Home</span>
            </button>

            <div 
              onClick={() => handleNavigatePath('/')}
              className="flex items-center gap-2 font-heading font-black text-lg sm:text-xl tracking-tight text-white cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Droplets size={16} className="text-white fill-white/30" />
              </div>
              <div className="flex items-center gap-1">
                <span>Mirror Aqua</span>
                <span className="text-cyan-400">Store</span>
              </div>
            </div>
          </div>

          {/* Center: Dual Store Quick Switcher */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-full border border-slate-700/60 shadow-inner">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('store');
                else window.location.hash = '#store';
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Switch to Mirror Solar Store"
            >
              <Sun size={13} className="text-amber-400" />
              <span>Solar Store</span>
            </button>
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm">
              <Droplets size={13} className="text-cyan-200 fill-cyan-200/30" />
              <span>Aqua Store</span>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
              title="Search Aqua Products"
              aria-label="Search Aqua Products"
            >
              <Search size={16} />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-all relative cursor-pointer"
              title="View Wishlist"
              aria-label="View Wishlist"
            >
              <Heart size={16} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Track Orders */}
            <button
              onClick={() => handleNavigatePath('/track')}
              className="inline-flex items-center gap-1.5 bg-[#122842] hover:bg-[#1A385C] border border-cyan-800/40 text-cyan-200 hover:text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Truck size={14} className="text-cyan-400" />
              <span className="hidden md:inline">Track Order</span>
              <span className="md:hidden">Track</span>
            </button>

            {/* Cart Drawer Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-xl shadow-md transition-all relative cursor-pointer"
              title="Open Aqua Cart"
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Cart</span>
              {totalItemCount > 0 && (
                <span className="bg-white text-cyan-900 text-[11px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {totalItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Aqua Store Content Area */}
      <main className="max-w-[1400px] mx-auto px-2 sm:px-4">
        {renderCurrentPage()}
      </main>

      {/* Global Aqua Drawers & Modals */}
      <CartDrawer onNavigate={handleNavigatePath} />
      <WishlistDrawer onNavigate={handleNavigatePath} />
      <SearchDrawer onNavigate={handleNavigatePath} />
      <MobileNavDrawer currentPath={currentPath} onNavigate={handleNavigatePath} />
      <QuickViewModal onNavigate={handleNavigatePath} />

      {/* Floating WhatsApp Support Bot */}
      <WhatsAppBotButton />
    </div>
  );
}

export default function MirrorAquaStore({ onBackToHome, onNavigate, initialPath = '/' }) {
  return (
    <UIProvider>
      <WishlistProvider>
        <CartProvider>
          <AquaStoreContent 
            onBackToHome={onBackToHome} 
            onNavigate={onNavigate} 
            initialPath={initialPath} 
          />
        </CartProvider>
      </WishlistProvider>
    </UIProvider>
  );
}
