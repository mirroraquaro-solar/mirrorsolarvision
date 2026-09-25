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

const isOrderHash = (hash) => {
  const h = (hash || '').toLowerCase();
  return h === '#orders' || h === '#my-orders' || h === '#myorders' || h === '#track' || h === '#track-order' || h === '#tracking';
};

const isAquaHash = (hash) => {
  const h = (hash || '').toLowerCase();
  return h === '#aqua' || h === '#aqua-store' || h === '#mirror-aqua' || h === '#aqua-shop' || h === '#aqua-cart' || h === '#aqua-checkout' || h === '#aqua-track' || h === '#spun-filter' || h === '#pp-filter';
};

const isStoreHash = (hash) => {
  const h = (hash || '').toLowerCase();
  return h === '#store' || h === '#solar-store' || h === '#bulk-combos' || h === '#bulk-combo' || h === '#bulk-combo-buy' || h === '#drain-clips' || h === '#drain-clips-buy' || h === '#shop';
};

function App() {
  const [storeAction, setStoreAction] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#bulk-combo' || hash === '#bulk-combos') return 'bulk-combo';
    if (hash === '#bulk-combo-buy') return 'bulk-combo-buy';
    if (hash === '#drain-clips-buy') return 'drain-clips-buy';
    if (hash === '#drain-clips') return 'drain-clips';
    return null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (isOrderHash(hash)) return 'orders';
    if (isAquaHash(hash)) return 'aqua-store';
    if (isStoreHash(hash)) return 'store';
    if (hash === '#partner-registration') return 'partner-registration';
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (isOrderHash(hash)) {
        setCurrentView('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isAquaHash(hash)) {
        setCurrentView('aqua-store');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (isStoreHash(hash)) {
        setCurrentView('store');
        setStoreAction(
          hash === '#bulk-combo' || hash === '#bulk-combos' 
            ? 'bulk-combo' 
            : hash === '#bulk-combo-buy'
            ? 'bulk-combo-buy'
            : hash === '#drain-clips-buy'
            ? 'drain-clips-buy'
            : hash === '#drain-clips' 
            ? 'drain-clips' 
            : null
        );
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#partner-registration') {
        setCurrentView('partner-registration');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#home' || hash === '') {
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (view, action = null) => {
    if (view === 'orders' || view === 'my-orders' || view === 'track' || view === 'track-order') {
      setCurrentView('orders');
      if (window.location.hash !== '#orders') {
        window.location.hash = '#orders';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'aqua' || view === 'aqua-store' || view === 'mirror-aqua') {
      setCurrentView('aqua-store');
      if (window.location.hash !== '#aqua-store') {
        window.location.hash = '#aqua-store';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'store' || view === 'solar-store' || view === 'bulk-combos' || view === 'bulk-combo' || view === 'bulk-combo-buy' || view === 'drain-clips' || view === 'drain-clips-buy') {
      setCurrentView('store');
      const finalAction = action || (view !== 'store' && view !== 'solar-store' ? view : null);
      setStoreAction(finalAction);
      const targetHash = finalAction ? `#${finalAction}` : '#store';
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'partner-registration') {
      setCurrentView('partner-registration');
      if (window.location.hash !== '#partner-registration') {
        window.location.hash = '#partner-registration';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
      if (window.location.hash !== '#home' && window.location.hash !== '') {
        window.location.hash = '#home';
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
