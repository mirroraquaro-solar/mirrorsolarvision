import React, { useState, useEffect, Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import Hero from './components/sections/Hero';
import AuthorizedDealers from './components/sections/AuthorizedDealers';
import AboutGroup from './components/sections/AboutGroup';
import WhyChooseUs from './components/sections/WhyChooseUs';
import StoreTeaser from './components/sections/StoreTeaser';
import SubsidyGuide from './components/sections/SubsidyGuide';
import SiteSurvey from './components/sections/SiteSurvey';
import Gallery from './components/sections/Gallery';
import Reviews from './components/sections/Reviews';
import QuoteForm from './components/sections/QuoteForm';
import NotificationPopup from './components/ui/NotificationPopup';

// Code-split dynamic views for instant mobile speed
const MirrorSolarStore = lazy(() => import('./components/sections/MirrorSolarStore'));
const MirrorAquaStore = lazy(() => import('./components/sections/MirrorAquaStore'));
const MyOrders = lazy(() => import('./components/checkout/MyOrders'));
const PartnerRegistration = lazy(() => import('./pages/PartnerRegistration'));

const resolveRoute = () => {
  if (typeof window === 'undefined') return { view: 'home', action: null };
  const pathname = (window.location.pathname || '').toLowerCase().replace(/\/$/, '');
  const hash = (window.location.hash || '').toLowerCase();

  // 1. Order Tracking
  if (
    pathname === '/orders' || pathname === '/my-orders' || pathname === '/track' || pathname === '/track-order' ||
    hash === '#orders' || hash === '#my-orders' || hash === '#myorders' || hash === '#track' || hash === '#track-order' || hash === '#tracking'
  ) {
    return { view: 'orders', action: null };
  }

  // 2. Solar Drain Clips Product Page (Canonical Meta URL)
  if (
    pathname === '/drain-clips' || pathname === '/products/drain-clips' || pathname === '/products/solar-drain-clips' || pathname === '/products/msv-drain-clips' ||
    hash === '#drain-clips'
  ) {
    return { view: 'store', action: 'drain-clips' };
  }
  if (
    pathname === '/drain-clips/buy' || pathname === '/products/drain-clips/buy' ||
    hash === '#drain-clips-buy'
  ) {
    return { view: 'store', action: 'drain-clips-buy' };
  }

  // 3. Bulk Combo Product Page
  if (
    pathname === '/bulk-combo' || pathname === '/bulk-combos' || pathname === '/products/bulk-combo' || pathname === '/products/solar-hardware-combo' ||
    hash === '#bulk-combo' || hash === '#bulk-combos'
  ) {
    return { view: 'store', action: 'bulk-combo' };
  }
  if (
    pathname === '/bulk-combo/buy' || pathname === '/products/bulk-combo/buy' ||
    hash === '#bulk-combo-buy'
  ) {
    return { view: 'store', action: 'bulk-combo-buy' };
  }

  // 4. Solar Store
  if (
    pathname === '/store' || pathname === '/solar-store' || pathname === '/shop' ||
    hash === '#store' || hash === '#solar-store' || hash === '#shop'
  ) {
    return { view: 'store', action: null };
  }

  // 5. Mirror Aqua Store & Spun Filter Products
  if (
    pathname === '/aqua' || pathname === '/aqua-store' || pathname === '/mirror-aqua' || 
    pathname.startsWith('/products/10-inch') || pathname.startsWith('/products/5-spun') || pathname === '/spun-filter' || pathname === '/pp-filter' ||
    hash === '#aqua' || hash === '#aqua-store' || hash === '#mirror-aqua' || hash === '#aqua-shop' || hash === '#aqua-cart' || hash === '#aqua-checkout' || hash === '#spun-filter' || hash === '#pp-filter'
  ) {
    return { view: 'aqua-store', action: null };
  }

  // 6. Partner Registration
  if (pathname === '/partner-registration' || hash === '#partner-registration') {
    return { view: 'partner-registration', action: null };
  }

  return { view: 'home', action: null };
};

function App() {
  const initialRoute = resolveRoute();
  const [storeAction, setStoreAction] = useState(initialRoute.action);
  const [currentView, setCurrentView] = useState(initialRoute.view);

  useEffect(() => {
    const handleLocationChange = () => {
      const route = resolveRoute();
      setCurrentView(route.view);
      setStoreAction(route.action);

      // Dynamic SEO Title and Metadata updates for Meta / Google scrapers
      if (route.action === 'drain-clips' || route.action === 'drain-clips-buy') {
        document.title = 'MSV Heavy-Duty Solar Panel Drain Clips | Buy Online ₹499 | Mirror Solar Vision';
      } else if (route.action === 'bulk-combo' || route.action === 'bulk-combo-buy') {
        document.title = '₹15,000 Bulk Solar Installation Combo | Mirror Solar Vision';
      } else if (route.view === 'aqua-store') {
        document.title = 'Mirror Aqua 10" PP Spun Filters & Combos | Buy Online ₹199 | Mirror Life';
      } else if (route.view === 'orders') {
        document.title = 'Track Solar Order & Live Logistics | Mirror Solar Vision';
      } else {
        document.title = 'Mirror Solar Vision | Rooftop Solar Installation, PM Surya Ghar Subsidy & Solar Hardware Andhra Pradesh';
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    // Run on initial load
    handleLocationChange();

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleNavigate = (view, action = null) => {
    if (view === 'orders' || view === 'my-orders' || view === 'track' || view === 'track-order') {
      setCurrentView('orders');
      if (window.location.pathname !== '/orders') {
        window.history.pushState({}, '', '/orders');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'aqua' || view === 'aqua-store' || view === 'mirror-aqua') {
      setCurrentView('aqua-store');
      if (window.location.pathname !== '/aqua-store') {
        window.history.pushState({}, '', '/aqua-store');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'store' || view === 'solar-store' || view === 'bulk-combos' || view === 'bulk-combo' || view === 'bulk-combo-buy' || view === 'drain-clips' || view === 'drain-clips-buy') {
      setCurrentView('store');
      const finalAction = action || (view !== 'store' && view !== 'solar-store' ? view : null);
      setStoreAction(finalAction);
      const targetPath = finalAction === 'drain-clips' ? '/drain-clips' : finalAction === 'bulk-combo' ? '/bulk-combo' : '/store';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'partner-registration') {
      setCurrentView('partner-registration');
      if (window.location.pathname !== '/partner-registration') {
        window.history.pushState({}, '', '/partner-registration');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Layout onNavigate={handleNavigate}>
      {currentView === 'home' ? (
        <>
          <NotificationPopup />
          <Hero onNavigate={handleNavigate} />
          <AuthorizedDealers />
          <StoreTeaser onNavigateToStore={(action) => handleNavigate('store', action)} />
          <AboutGroup />
          <WhyChooseUs />
          <Gallery />
          <Reviews />
          <SubsidyGuide />
          <SiteSurvey />
          <QuoteForm />
        </>
      ) : (
        <Suspense fallback={
          <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading...</span>
          </div>
        }>
          {currentView === 'store' ? (
            <MirrorSolarStore 
              key="view-store"
              initialView="store"
              initialAction={storeAction}
              onBackToHome={() => handleNavigate('home')}
              onNavigate={handleNavigate}
            />
          ) : currentView === 'aqua-store' ? (
            <MirrorAquaStore
              key="view-aqua-store"
              onBackToHome={() => handleNavigate('home')}
              onNavigate={handleNavigate}
            />
          ) : currentView === 'orders' ? (
            <MyOrders 
              key="view-orders"
              onBackToStore={() => handleNavigate('store')}
              onBackToHome={() => handleNavigate('home')}
            />
          ) : currentView === 'partner-registration' ? (
            <PartnerRegistration 
              key="view-partner"
              onBack={() => handleNavigate('home')} 
            />
          ) : null}
        </Suspense>
      )}
    </Layout>
  );
}

export default App;
