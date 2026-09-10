import React, { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import Hero from './components/sections/Hero';
import AuthorizedDealers from './components/sections/AuthorizedDealers';
import AboutGroup from './components/sections/AboutGroup';
import WhyChooseUs from './components/sections/WhyChooseUs';
import StoreTeaser from './components/sections/StoreTeaser';
import MirrorSolarStore from './components/sections/MirrorSolarStore';
import SubsidyGuide from './components/sections/SubsidyGuide';
import Gallery from './components/sections/Gallery';
import Reviews from './components/sections/Reviews';
import QuoteForm from './components/sections/QuoteForm';
import NotificationPopup from './components/ui/NotificationPopup';
import PartnerRegistration from './pages/PartnerRegistration';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#orders' || hash === '#my-orders' || hash === '#track') return 'orders';
    if (hash === '#store' || hash === '#bulk-combos' || hash === '#bulk-combo' || hash === '#drain-clips' || hash === '#shop') return 'store';
    if (hash === '#partner-registration') return 'partner-registration';
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#orders' || hash === '#my-orders' || hash === '#track') {
        setCurrentView('orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#store' || hash === '#bulk-combos' || hash === '#bulk-combo' || hash === '#drain-clips' || hash === '#shop') {
        setCurrentView('store');
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

  const handleNavigate = (view) => {
    if (view === 'orders' || view === 'my-orders' || view === 'track') {
      setCurrentView('orders');
      if (window.location.hash !== '#orders') {
        window.location.hash = '#orders';
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'store' || view === 'bulk-combos' || view === 'bulk-combo' || view === 'drain-clips') {
      setCurrentView('store');
      if (window.location.hash !== '#store') {
        window.location.hash = '#store';
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
          <StoreTeaser onNavigateToStore={() => handleNavigate('store')} />
          <AboutGroup />
          <WhyChooseUs />
          <Gallery />
          <Reviews />
          <SubsidyGuide />
          <QuoteForm />
        </>
      ) : currentView === 'store' ? (
        <MirrorSolarStore 
          key="view-store"
          initialView="store"
          onBackToHome={() => handleNavigate('home')}
          onNavigate={handleNavigate}
        />
      ) : currentView === 'orders' ? (
        <MirrorSolarStore 
          key="view-orders"
          initialView="orders"
          onBackToHome={() => handleNavigate('home')}
          onNavigate={handleNavigate}
        />
      ) : currentView === 'partner-registration' ? (
        <PartnerRegistration 
          key="view-partner"
          onBack={() => handleNavigate('home')} 
        />
      ) : null}
    </Layout>
  );
}

export default App;
